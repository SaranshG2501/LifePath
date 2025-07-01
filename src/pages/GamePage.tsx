/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameContext } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import SceneDisplay from '@/components/SceneDisplay';
import MetricsDisplay from '@/components/MetricsDisplay';
import ResultsSummary from '@/components/ResultsSummary';
import MirrorMoment from '@/components/MirrorMoment';
import EnhancedClassroomVoting from '@/components/EnhancedClassroomVoting';
import LiveSessionModal from '@/components/classroom/LiveSessionModal';
import LiveSessionTracker from '@/components/classroom/LiveSessionTracker';
import NotificationModal from '@/components/classroom/NotificationModal';
import { Sparkles, Loader2, Users, User, ToggleLeft, ToggleRight, Wifi, Lock, Radio } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { 
  LiveSession, 
  SessionParticipant, 
  onLiveSessionUpdated, 
  joinLiveSession, 
  submitLiveChoice,
  advanceLiveSession,
  endLiveSession,
  getActiveSession,
  onNotificationsUpdated,
  SessionNotification,
  onClassroomUpdated,
  Classroom,
  db
} from '@/lib/firebase';
import { getDoc, doc } from 'firebase/firestore';

const GamePage = () => {
  const { 
    gameState, 
    makeChoice, 
    resetGame, 
    isGameActive, 
    showMirrorMoment, 
    gameMode,
    setGameMode,
    userRole,
    classroomId,
    mirrorMomentsEnabled,
    toggleMirrorMoments,
    setCurrentScene,
    startScenario
  } = useGameContext();
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  const [liveSession, setLiveSession] = useState<LiveSession | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [isInLiveSession, setIsInLiveSession] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [pendingSession, setPendingSession] = useState<SessionNotification | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [popupHandledSessionId, setPopupHandledSessionId] = useState<string | null>(null);
  const [showResultScreen, setShowResultScreen] = useState(false);
  const [sessionResult, setSessionResult] = useState<any>(null);

  useEffect(() => {
    if (!isGameActive) {
      navigate('/');
    }
  }, [isGameActive, navigate]);

  // Enhanced immediate notification listener for students
  useEffect(() => {
    if (!currentUser || userRole !== 'student' || !classroomId) return;

    console.log("Setting up immediate notification listener for student:", currentUser.uid);
    
    // Listen for classroom updates that include active sessions
    const unsubscribeClassroom = onClassroomUpdated(classroomId, async (classroom) => {
      console.log("Classroom updated with activeSessionId:", classroom.activeSessionId);
      
      // If there's a new active session and we're not already in one
      if (classroom.activeSessionId && 
          !isInLiveSession && 
          classroom.activeSessionId !== popupHandledSessionId) {
        
        try {
          const activeSession = await getActiveSession(classroomId);
          if (activeSession && activeSession.status === 'active') {
            console.log("Immediate session notification:", activeSession);
            
            // Create notification-like object for immediate display
            const immediateNotification: SessionNotification = {
              id: activeSession.id!,
              type: 'live_session_started',
              sessionId: activeSession.id!,
              teacherName: activeSession.teacherName,
              scenarioTitle: activeSession.scenarioTitle,
              classroomName: classroom.name,
              timestamp: new Date()
            };
            
            setPendingSession(immediateNotification);
            setShowNotification(true);
          }
        } catch (error) {
          console.error("Error processing immediate session notification:", error);
        }
      }
    });

    // Also keep the traditional notification listener as backup
    const unsubscribeNotifications = onNotificationsUpdated(currentUser.uid, (notifications) => {
      const liveSessionNotification = notifications.find(n => n.type === 'live_session_started' && n.sessionId !== popupHandledSessionId);
      
      if (liveSessionNotification && !isInLiveSession && !showNotification) {
        console.log("Traditional notification received:", liveSessionNotification);
        setPendingSession(liveSessionNotification);
        setShowNotification(true);
      }
    });

    return () => {
      unsubscribeClassroom();
      unsubscribeNotifications();
    };
  }, [currentUser, userRole, classroomId, isInLiveSession, popupHandledSessionId, showNotification]);

  // Enhanced live session listener with real-time syncing
  useEffect(() => {
    if (liveSession?.id && isInLiveSession) {
      console.log("Setting up enhanced live session listener for:", liveSession.id);
      
      const unsubscribe = onLiveSessionUpdated(liveSession.id, (updatedSession) => {
        console.log("Live session updated:", updatedSession);
        setLiveSession(updatedSession);
        
        // Immediate session end handling
        if (updatedSession.status === 'ended') {
          console.log("Session ended immediately");
          setIsInLiveSession(false);
          setHasVoted(false);
          setPopupHandledSessionId(null);
          
          if (updatedSession.resultPayload) {
            setSessionResult(updatedSession.resultPayload);
            setShowResultScreen(true);
          } else {
            setLiveSession(null);
            toast({
              title: "Session Ended",
              description: "The live session has been ended by the teacher.",
            });
          }
          return;
        }
        
        // Real-time scene synchronization for students
        if (userRole === 'student' && 
            updatedSession.currentSceneId && 
            gameState.currentScene?.id !== updatedSession.currentSceneId) {
          console.log("Syncing student to teacher's scene:", updatedSession.currentSceneId);
          setCurrentScene(updatedSession.currentSceneId);
          setHasVoted(false); // Reset vote status for new scene
          
          toast({
            title: "Scene Updated",
            description: "Your teacher has advanced to the next scene.",
          });
        }
        
        // Check if current user has voted
        if (currentUser && updatedSession.currentChoices?.[currentUser.uid]) {
          setHasVoted(true);
        } else {
          setHasVoted(false);
        }
      });

      return unsubscribe;
    }
  }, [liveSession?.id, isInLiveSession, gameState.currentScene?.id, setCurrentScene, currentUser, toast, userRole]);

  // Improved join from notification handler
  const handleJoinFromNotification = useCallback(async () => {
    if (!pendingSession || !currentUser || !userProfile) return;

    setIsJoining(true);
    try {
      console.log("Smoothly joining live session from notification:", pendingSession.sessionId);
      
      setPopupHandledSessionId(pendingSession.sessionId);
      setGameMode("classroom");
      
      const sessionData = await joinLiveSession(pendingSession.sessionId, currentUser.uid, userProfile.displayName || 'Student');
      
      if (sessionData && sessionData.status === 'active') {
        setLiveSession(sessionData);
        setIsInLiveSession(true);
        
        // Auto-start the scenario smoothly
        console.log("Auto-loading scenario:", sessionData.scenarioId);
        startScenario(sessionData.scenarioId);
        
        // Sync to current scene if teacher has progressed
        if (sessionData.currentSceneId) {
          setTimeout(() => {
            setCurrentScene(sessionData.currentSceneId);
          }, 500); // Small delay to ensure scenario is loaded first
        }
        
        toast({
          title: "🎯 Joined Live Session!",
          description: `Successfully connected to "${sessionData.scenarioTitle}"`,
        });
      } else {
        throw new Error("Session is not active");
      }
      
      setShowNotification(false);
      setPendingSession(null);
    } catch (error) {
      console.error("Error joining live session:", error);
      setPopupHandledSessionId(null);
      toast({
        title: "Connection Failed",
        description: "Unable to join the live session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  }, [pendingSession, currentUser, userProfile, setGameMode, startScenario, setCurrentScene, toast]);

  const handleDismissNotification = () => {
    if (pendingSession) {
      setPopupHandledSessionId(pendingSession.sessionId);
    }
    setShowNotification(false);
    setPendingSession(null);
  };

  // Enhanced live choice submission with immediate feedback
  const handleLiveChoice = async (choiceId: string) => {
    if (liveSession?.id && currentUser && !hasVoted) {
      try {
        console.log("Submitting live choice with immediate feedback:", choiceId);
        setHasVoted(true); // Immediate UI feedback
        
        await submitLiveChoice(liveSession.id, currentUser.uid, choiceId, gameState.currentScene?.id);
        
        toast({
          title: "✅ Choice Submitted",
          description: "Your decision has been recorded successfully!",
        });
      } catch (error) {
        console.error("Error submitting live choice:", error);
        setHasVoted(false); // Revert on error
        toast({
          title: "Submission Error",
          description: "Failed to record your choice. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  // Enhanced scene advancement with immediate sync
  const handleAdvanceScene = async (nextSceneId: string) => {
    if (liveSession?.id) {
      try {
        console.log("Advancing scene with immediate sync:", nextSceneId);
        
        let nextSceneIndex;
        if (gameState.currentScenario) {
          const nextIndex = gameState.currentScenario.scenes.findIndex(s => s.id === nextSceneId);
          if (nextIndex >= 0) {
            nextSceneIndex = nextIndex;
          }
        }
        
        // Advance session first for immediate sync to students
        await advanceLiveSession(liveSession.id, nextSceneId, nextSceneIndex);
        
        // Then advance teacher's local state
        makeChoice('advance');
        
        toast({
          title: "Scene Advanced",
          description: "All students will be synced to the new scene.",
        });
      } catch (error) {
        console.error("Error advancing scene:", error);
        toast({
          title: "Error",
          description: "Failed to advance scene. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleEndLiveSession = async () => {
    if (liveSession?.id && classroomId) {
      try {
        const resultPayload = {
          choices: liveSession.currentChoices || {},
          metrics: gameState.metrics,
          summary: `Session completed for "${liveSession.scenarioTitle}"`
        };
        
        await endLiveSession(liveSession.id, classroomId, resultPayload);
        setIsInLiveSession(false);
        setLiveSession(null);
        setHasVoted(false);
        setPopupHandledSessionId(null);
        
        toast({
          title: "Session Ended",
          description: "The live session has been ended successfully.",
        });
      } catch (error) {
        console.error("Error ending session:", error);
        toast({
          title: "Error",
          description: "Failed to end the session. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleJoinLiveSession = async () => {
    if (!liveSession || !currentUser || !userProfile) return;

    setIsJoining(true);
    try {
      setPopupHandledSessionId(liveSession.id!);
      
      const sessionData = await joinLiveSession(liveSession.id!, currentUser.uid, userProfile.displayName || 'Student');
      
      if (sessionData.status === 'active') {
        setIsInLiveSession(true);
        setShowJoinModal(false);
        
        startScenario(liveSession.scenarioId);
        
        if (liveSession.currentSceneId) {
          setTimeout(() => setCurrentScene(liveSession.currentSceneId), 500);
        }
        
        toast({
          title: "🎯 Joined Live Session!",
          description: `Connected to "${liveSession.scenarioTitle}"`,
        });
      }
    } catch (error) {
      console.error("Error joining live session:", error);
      setPopupHandledSessionId(null);
      toast({
        title: "Connection Failed",
        description: "Unable to join the live session.",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleDeclineLiveSession = () => {
    if (liveSession) {
      setPopupHandledSessionId(liveSession.id!);
    }
    setShowJoinModal(false);
    setLiveSession(null);
  };

  const handleChoiceMade = (choiceId: string) => {
    if (isInLiveSession && liveSession) {
      handleLiveChoice(choiceId);
    } else {
      makeChoice(choiceId);
    }
  };

  const handleReturnHome = () => {
    resetGame();
    setShowResultScreen(false);
    setSessionResult(null);
    setPopupHandledSessionId(null);
    navigate('/');
  };

  const handlePlayAgain = () => {
    if (gameState.currentScenario) {
      resetGame();
      setShowResultScreen(false);
      setSessionResult(null);
      setPopupHandledSessionId(null);
      setTimeout(() => {
        navigate('/');
        navigate('/game');
      }, 100);
    }
  };
  
  const toggleGameMode = () => {
    if (userRole === 'teacher' && liveSession && liveSession.status === 'active') {
      toast({
        title: "Mode Locked",
        description: "You cannot switch modes while running a live session.",
        variant: "destructive",
      });
      return;
    }

    if (isInLiveSession) {
      toast({
        title: "Mode Locked",
        description: "You cannot change modes during a live session.",
        variant: "destructive",
      });
      return;
    }
    
    if (gameMode === "classroom") {
      setGameMode("individual");
      toast({
        title: "Individual Mode",
        description: "You're now playing in individual mode.",
      });
    } else {
      if (!classroomId) {
        toast({
          title: "Classroom Required",
          description: userRole === 'teacher' 
            ? "Please create a classroom first." 
            : "Please join a classroom first.",
          variant: "destructive",
        });
        return;
      }
      
      setGameMode("classroom");
      toast({
        title: "Classroom Mode",
        description: "You're now playing in classroom mode.",
      });
    }
  };

  if (!gameState.currentScenario || !gameState.currentScene) {
    return (
      <div className="container mx-auto px-4 py-8 text-center flex justify-center items-center min-h-[50vh]">
        <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 p-8 rounded-xl animate-pulse flex flex-col items-center gap-4 max-w-md w-full border border-white/10 shadow-lg">
          <div className="relative">
            <Sparkles className="text-indigo-300 h-10 w-10" />
            <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full"></div>
          </div>
          <Loader2 className="h-8 w-8 text-indigo-300 animate-spin" />
          <p className="text-white text-lg">Loading your adventure...</p>
        </div>
      </div>
    );
  }

  if (showResultScreen && sessionResult) {
    return (
      <div className="container mx-auto px-4 py-6 md:py-8 animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Session Complete!</h1>
          <p className="text-white/80 text-lg">{sessionResult.summary}</p>
        </div>
        
        <div className="flex gap-4 justify-center">
          <Button onClick={handleReturnHome} variant="outline" className="border-white/20 bg-black/20 text-white hover:bg-white/10">
            Return Home
          </Button>
          <Button onClick={handlePlayAgain} className="bg-primary hover:bg-primary/90">
            Play Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 animate-fade-in">
      {/* Header with scenario title, mode and metrics */}
      <div className="mb-6 md:mb-8">
        <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-xl p-4 border border-white/10 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-300" />
              {gameState.currentScenario.title}
              {isInLiveSession && (
                <div className="flex items-center gap-1 ml-2">
                  <Wifi className="h-4 w-4 text-green-400 animate-pulse" />
                  <Badge className="bg-green-500/20 text-green-300 border-0">
                    <Radio className="h-3 w-3 mr-1" />
                    Live
                  </Badge>
                </div>
              )}
            </h1>
            
            <div className="flex flex-wrap items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-1 border-indigo-300/20 bg-black/20 text-white hover:bg-indigo-900/20"
                onClick={toggleMirrorMoments}
                disabled={isInLiveSession}
              >
                {mirrorMomentsEnabled ? (
                  <ToggleRight className="h-4 w-4 text-indigo-300" />
                ) : (
                  <ToggleLeft className="h-4 w-4 text-white/50" />
                )}
                Mirror Moments
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-1 border-indigo-300/20 bg-black/20 text-white hover:bg-indigo-900/20"
                onClick={toggleGameMode}
                disabled={(!classroomId && gameMode === "individual") || isInLiveSession || (userRole === 'teacher' && liveSession?.status === 'active')}
              >
                {(isInLiveSession || (userRole === 'teacher' && liveSession?.status === 'active')) && <Lock className="h-4 w-4 text-orange-400 mr-1" />}
                {gameMode === "classroom" ? (
                  <>
                    <Users className="h-4 w-4 text-indigo-300" />
                    Classroom Mode
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4 text-white/50" />
                    Individual Mode
                  </>
                )}
              </Button>
            </div>
          </div>
          <MetricsDisplay metrics={gameState.metrics} compact={isMobile} />
        </div>
      </div>

      {/* Live Session Tracker for Teachers */}
      {isInLiveSession && liveSession && userRole === 'teacher' && (
        <div className="mb-6">
          <LiveSessionTracker
            session={liveSession}
            onAdvanceScene={handleAdvanceScene}
            onEndSession={handleEndLiveSession}
            isTeacher={true}
          />
        </div>
      )}

      {/* Main game content */}
      {gameState.currentScene.isEnding ? (
        <ResultsSummary 
          gameState={gameState} 
          onPlayAgain={handlePlayAgain} 
          onReturnHome={handleReturnHome} 
        />
      ) : showMirrorMoment ? (
        <MirrorMoment />
      ) : isInLiveSession ? (
        <SceneDisplay 
          scene={gameState.currentScene} 
          onChoiceMade={handleChoiceMade}
          isLiveSession={true}
          liveSession={liveSession}
          disabled={hasVoted}
        />
      ) : gameMode === "classroom" && !isInLiveSession ? (
        <EnhancedClassroomVoting scene={gameState.currentScene} />
      ) : (
        <SceneDisplay 
          scene={gameState.currentScene} 
          onChoiceMade={handleChoiceMade} 
        />
      )}

      {/* Live Session Join Modal */}
      <LiveSessionModal
        isOpen={showJoinModal}
        onClose={handleDeclineLiveSession}
        onJoin={handleJoinLiveSession}
        onDecline={handleDeclineLiveSession}
        teacherName={liveSession?.teacherName || 'Teacher'}
        scenarioTitle={liveSession?.scenarioTitle || ''}
        participantCount={liveSession?.participants.length || 0}
      />

      {/* Enhanced Session Notification Modal */}
      <NotificationModal
        isOpen={showNotification}
        onClose={handleDismissNotification}
        onJoin={handleJoinFromNotification}
        onDismiss={handleDismissNotification}
        teacherName={pendingSession?.teacherName || 'Teacher'}
        scenarioTitle={pendingSession?.scenarioTitle || ''}
        classroomName={pendingSession?.classroomName}
        isJoining={isJoining}
      />
    </div>
  );
};

export default GamePage;
