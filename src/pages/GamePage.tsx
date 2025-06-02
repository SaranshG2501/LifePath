
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SceneDisplay from '@/components/SceneDisplay';
import EnhancedClassroomVoting from '@/components/EnhancedClassroomVoting';
import { useGameContext } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import { scenarios } from '@/data/scenarios';
import { 
  startClassroomScenario, 
  advanceClassroomScene, 
  onClassroomUpdated, 
  getActiveSession, 
  joinLiveSession, 
  onNotificationsUpdated 
} from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import NotificationModal from '@/components/classroom/NotificationModal';

const GamePage = () => {
  const {
    scenarioId,
    setScene,
    makeChoice,
    userRole,
    classroomId,
    setGameMode,
    setClassroomId,
    startScenario,
    currentScene,
    setCurrentScene: setContextCurrentScene,
    isLiveSession,
    setIsLiveSession,
    liveSessionData,
    setLiveSessionData
  } = useGameContext();
  
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [gameState, setGameState] = useState({
    currentSceneId: currentScene || 'start',
    scenarioComplete: false,
    studentProgress: {}
  });
  
  const [scene, setSceneState] = useState<any>(null);
  const [scenario, setScenario] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState<any>(null);
  
  // Add notification state
  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState<any>(null);
  
  // Set up notification listener for students
  useEffect(() => {
    if (!currentUser || userRole !== 'student') return;
    
    console.log("Setting up notification listener for student:", currentUser.uid);
    
    const unsubscribe = onNotificationsUpdated(currentUser.uid, (notifications) => {
      console.log("Received notifications:", notifications);
      if (notifications.length > 0) {
        const latestNotification = notifications[0];
        if (latestNotification.type === 'live_session_started') {
          setNotificationData(latestNotification);
          setShowNotification(true);
        }
      }
    });
    
    return () => unsubscribe();
  }, [currentUser, userRole]);
  
  // Handle joining live session from notification
  const handleJoinLiveSession = async () => {
    if (!notificationData || !currentUser || !userProfile) return;
    
    try {
      console.log("Joining live session from notification:", notificationData.sessionId);
      await joinLiveSession(
        notificationData.sessionId,
        currentUser.uid,
        userProfile.displayName || 'Student'
      );
      
      // Set game context for live session
      setClassroomId(notificationData.classroomId);
      setGameMode("classroom");
      
      // Get session details to start the scenario
      const session = await getActiveSession(notificationData.classroomId);
      if (session) {
        startScenario(session.scenarioId);
        setContextCurrentScene(session.currentSceneId);
        setIsLiveSession(true);
        setLiveSessionData(session);
      }
      
      setShowNotification(false);
      
      toast({
        title: "Joined Live Session",
        description: `You're now part of the live session for "${notificationData.scenarioTitle}"`
      });
      
    } catch (error) {
      console.error("Error joining live session:", error);
      toast({
        title: "Error",
        description: "Failed to join the live session. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleDismissNotification = () => {
    setShowNotification(false);
  };
  
  // Fetch scenario and initial scene
  useEffect(() => {
    if (!scenarioId) {
      navigate('/');
      return;
    }
    
    const selectedScenario = scenarios.find(s => s.id === scenarioId);
    if (!selectedScenario) {
      navigate('/');
      return;
    }
    
    setScenario(selectedScenario);
    
    const initialScene = selectedScenario.scenes.find(scene => scene.id === (currentScene || 'start'));
    if (initialScene) {
      setSceneState(initialScene);
    }
    
    setLoading(false);
  }, [scenarioId, navigate, currentScene]);
  
  // Classroom mode: Listen for classroom updates
  useEffect(() => {
    if (userRole === 'teacher' && classroomId) {
      const unsubscribe = onClassroomUpdated(classroomId, (updatedClassroom) => {
        if (updatedClassroom.currentScene) {
          setGameState({
            ...gameState,
            currentSceneId: updatedClassroom.currentScene
          });
          
          // Update the scene in context
          setContextCurrentScene(updatedClassroom.currentScene);
          
          // Find and set the new scene
          const newScene = scenario?.scenes.find((scene: any) => scene.id === updatedClassroom.currentScene);
          if (newScene) {
            setSceneState(newScene);
          }
        }
      });
      
      return () => unsubscribe();
    }
  }, [userRole, classroomId, scenario, setContextCurrentScene, gameState]);
  
  // Student mode: Check for active live session
  useEffect(() => {
    if (userRole === 'student' && classroomId) {
      const checkActiveSession = async () => {
        try {
          const session = await getActiveSession(classroomId);
          setActiveSession(session);
          setIsLiveSession(!!session);
          setLiveSessionData(session);
        } catch (error) {
          console.error("Error checking active session:", error);
        }
      };
      
      checkActiveSession();
    }
  }, [userRole, classroomId, setIsLiveSession, setLiveSessionData]);
  
  // Local makeChoice function
  const handleMakeChoice = async (choiceId: string) => {
    if (!scene) return;
    
    const choice = scene.choices.find((c: any) => c.id === choiceId);
    if (!choice) return;
    
    // Update user metrics
    if (choice.metricChanges) {
      // TODO: Implement metric changes
    }
    
    // Check if choice leads to another scene or ends the scenario
    if (choice.nextSceneId) {
      if (userRole === 'teacher' && classroomId) {
        // Advance the classroom scene
        await advanceClassroomScene(classroomId, choice.nextSceneId);
      } else {
        // Just set the next scene for individual play
        const nextScene = scenario?.scenes.find((s: any) => s.id === choice.nextSceneId);
        if (nextScene) {
          setSceneState(nextScene);
          setContextCurrentScene(nextScene.id);
        }
      }
    } else if (choice.isEnding) {
      // End the scenario
      setGameState({
        ...gameState,
        scenarioComplete: true
      });
    }
  };
  
  // Set the scene based on the currentSceneId
  useEffect(() => {
    if (scenario && gameState.currentSceneId) {
      const newScene = scenario.scenes.find((s: any) => s.id === gameState.currentSceneId);
      if (newScene) {
        setSceneState(newScene);
        setContextCurrentScene(newScene.id);
      } else {
        console.error(`Scene with id ${gameState.currentSceneId} not found`);
      }
    }
  }, [scenario, gameState.currentSceneId, setContextCurrentScene]);
  
  // Start classroom scenario (Teacher only)
  useEffect(() => {
    if (userRole === 'teacher' && classroomId && scenarioId) {
      const start = async () => {
        try {
          await startClassroomScenario(classroomId, scenarioId, 'start');
        } catch (error) {
          console.error("Error starting classroom scenario:", error);
        }
      };
      
      start();
    }
  }, [userRole, classroomId, scenarioId]);
  
  if (loading || !scene || !scenario) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white overflow-hidden">
      <div className="container mx-auto p-4">
        {gameState.scenarioComplete ? (
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Scenario Complete!</h1>
            <p>Thank you for playing {scenario.title}</p>
          </div>
        ) : (
          <>
            {userRole === 'teacher' || isLiveSession ? (
              <EnhancedClassroomVoting scene={scene} />
            ) : (
              <SceneDisplay 
                scene={scene}
                onChoiceMade={handleMakeChoice}
              />
            )}
          </>
        )}
      </div>
      
      {showNotification && notificationData && (
        <NotificationModal
          isOpen={showNotification}
          onClose={() => setShowNotification(false)}
          onJoin={handleJoinLiveSession}
          onDismiss={handleDismissNotification}
          teacherName={notificationData.teacherName || 'Teacher'}
          scenarioTitle={notificationData.scenarioTitle || 'Live Session'}
          classroomName={notificationData.classroomName}
        />
      )}
    </div>
  );
};

export default GamePage;
