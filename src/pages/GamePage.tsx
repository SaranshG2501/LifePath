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
  submitStudentVote,
  advanceLiveSession,
  endLiveSession,
  getActiveSession,
  onNotificationsUpdated,
  SessionNotification,
  onClassroomUpdated,
  Classroom,
  db,
  getScenario
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
    startScenario,
    loadScenario
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
  const [sceneAdvanceDebounce, setSceneAdvanceDebounce] = useState(false);
  const [lastProcessedClassroomData, setLastProcessedClassroomData] = useState<Classroom | null>(null);
  const [modeLocked, setModeLocked] = useState(false);

  // FIXED: Check if game is active and handle redirects properly
  useEffect(() => {
    if (!isGameActive) {
      // Check if we have an active live session to join
      if (classroomId && userRole === 'student') {
        checkForActiveLiveSession();
      } else {
        navigate('/');
      }
    }
  }, [isGameActive, navigate, classroomId, userRole]);

  // ENHANCED: Check for active live session on page load
  const checkForActiveLiveSession = async () => {
    if (!classroomId || !currentUser) return;

    try {
      console.log("Checking for active live session in classroom:", classroomId);
      const activeSession = await getActiveSession(classroomId);
      
      if (activeSession && activeSession.status === 'active') {
        console.log("Found active session, loading scenario:", activeSession.scenarioId);
        
        // Load the scenario first
        await loadScenario(activeSession.scenarioId);
        
        // Set up live session
        setLiveSession(activeSession);
        setShowJoinModal(true);
      }
    } catch (error) {
      console.error("Error checking for active session:", error);
    }
  };

  // Check for mode lock on component mount
  useEffect(() => {
    const lockMode = localStorage.getItem('lockMode');
    if (lockMode === 'true') {
      setModeLocked(true);
    }
  }, []);

  // ENHANCED: Live session listener with CRITICAL scene syncing
  useEffect(() => {
    if (liveSession?.id && isInLiveSession) {
      console.log("Setting up live session listener for:", liveSession.id);
      
      const unsubscribe = onLiveSessionUpdated(liveSession.id, async (updatedSession) => {
        console.log("Live session updated:", updatedSession);
        setLiveSession(updatedSession);
        
        // Check if session ended
        if (updatedSession.status === 'ended') {
          console.log("Session ended, showing results");
          handleSessionEnd(updatedSession);
          return;
        }
        
        // CRITICAL: Enhanced Scene Sync - Load scenario and sync scene
        if (updatedSession.currentSceneId && 
            gameState.currentScene?.id !== updatedSession.currentSceneId &&
            !sceneAdvanceDebounce) {
          
          console.log("Syncing to teacher's scene:", updatedSession.currentSceneId);
          setSceneAdvanceDebounce(true);
          
          try {
            // Ensure we have the right scenario loaded
            if (gameState.currentScenario?.id !== updatedSession.scenarioId) {
              console.log("Loading scenario for sync:", updatedSession.scenarioId);
              await loadScenario(updatedSession.scenarioId);
            }
            
            // Force scene update
            setCurrentScene(updatedSession.currentSceneId);
            setHasVoted(false); // Reset vote status for new scene
            
            toast({
              title: "📄 New Scene",
              description: "The teacher has advanced to the next scene.",
            });
          } catch (error) {
            console.error("Error syncing scene:", error);
          } finally {
            setTimeout(() => setSceneAdvanceDebounce(false), 1000);
          }
        }
        
        // Check vote status
        if (currentUser) {
          const userVoted = updatedSession.votes?.[currentUser.uid];
          const votesCleared = !updatedSession.votes || Object.keys(updatedSession.votes).length === 0;
          
          if (votesCleared && hasVoted) {
            console.log("Votes cleared for new scene, resetting vote status");
            setHasVoted(false);
          } else if (userVoted && !hasVoted) {
            setHasVoted(true);
          }
        }
      });

      return unsubscribe;
    }
  }, [liveSession?.id, isInLiveSession, gameState.currentScene?.id, gameState.currentScenario?.id, currentUser, hasVoted, loadScenario, setCurrentScene, toast, sceneAdvanceDebounce]);

  // Handle session end
  const handleSessionEnd = (endedSession: LiveSession) => {
    setIsInLiveSession(false);
    setHasVoted(false);
    setPopupHandledSessionId(null);
    setModeLocked(false);
    localStorage.removeItem('lockMode');
    
    if (endedSession.resultPayload) {
      setSessionResult(endedSession.resultPayload);
      setShowResultScreen(true);
    } else {
      setLiveSession(null);
      toast({
        title: "Session Ended",
        description: "The live session has been ended by the teacher.",
      });
    }
  };

  // ENHANCED: Join live session with proper scenario loading
  const handleJoinLiveSession = async () => {
    if (!liveSession || !currentUser || !userProfile) return;

    setIsJoining(true);
    try {
      console.log("Joining live session:", liveSession.id);
      
      setPopupHandledSessionId(liveSession.id!);
      
      const sessionData = await joinLiveSession(liveSession.id!, currentUser.uid, userProfile.displayName || 'Student');
      
      if (sessionData.status === 'active') {
        setIsInLiveSession(true);
        setShowJoinModal(false);
        setModeLocked(true);
        localStorage.setItem('lockMode', 'true');
        
        // Load scenario and sync to current scene
        console.log("Loading scenario for live session:", sessionData.scenarioId);
        await loadScenario(sessionData.scenarioId);
        
        if (sessionData.currentSceneId) {
          setCurrentScene(sessionData.currentSceneId);
        }
        
        toast({
          title: "🎯 Joined Live Session!",
          description: `Connected to "${sessionData.scenarioTitle}" with ${sessionData.teacherName}`,
        });
      } else {
        throw new Error("Session is not active");
      }
    } catch (error) {
      console.error("Error joining live session:", error);
      setPopupHandledSessionId(null);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Unable to join the live session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  // ENHANCED: Handle student votes with real-time sync
  const handleLiveChoice = async (choiceId: string) => {
    if (liveSession?.id && currentUser && !hasVoted) {
      try {
        console.log("Submitting live vote:", choiceId);
        setHasVoted(true); // Optimistic update
        
        await submitStudentVote(liveSession.id, currentUser.uid, choiceId);
        
        toast({
          title: "✅ Vote Submitted",
          description: "Your decision has been recorded. Waiting for classmates...",
        });
      } catch (error) {
        console.error("Error submitting vote:", error);
        setHasVoted(false); // Revert optimistic update
        toast({
          title: "Submission Error",
          description: "Failed to record your vote. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  // ENHANCED: Handle scene advancement with vote reset
  const handleAdvanceScene = async (nextSceneId: string) => {
    if (liveSession?.id && !sceneAdvanceDebounce) {
      try {
        console.log("Advancing live session to scene:", nextSceneId);
        setSceneAdvanceDebounce(true);
        
        let nextSceneIndex;
        if (gameState.currentScenario) {
          const nextIndex = gameState.currentScenario.scenes.findIndex(s => s.id === nextSceneId);
          if (nextIndex >= 0) {
            nextSceneIndex = nextIndex;
          }
        }
        
        await advanceLiveSession(liveSession.id, nextSceneId, nextSceneIndex);
        makeChoice('advance');
        
        toast({
          title: "📄 Scene Advanced",
          description: "Moving to the next scene. All votes have been reset.",
        });
        
        setTimeout(() => setSceneAdvanceDebounce(false), 1000);
      } catch (error) {
        console.error("Error advancing scene:", error);
        setSceneAdvanceDebounce(false);
        
        toast({
          title: "Error",
          description: "Failed to advance to next scene. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleChoiceMade = (choiceId: string) => {
    if (isInLiveSession && liveSession) {
      handleLiveChoice(choiceId);
    } else {
      makeChoice(choiceId);
    }
  };

  // ENHANCED: Mode toggle with guest user protection
  const toggleGameMode = () => {
    // Check if user is a guest (not signed in)
    if (!currentUser) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to use classroom mode.",
        variant: "destructive",
      });
      return;
    }

    if (modeLocked || isInLiveSession) {
      toast({
        title: "Mode Locked",
        description: "You cannot change modes during a live session. Exit the session first.",
        variant: "destructive",
      });
      return;
    }

    if (userRole === 'teacher' && liveSession && liveSession.status === 'active') {
      toast({
        title: "Mode Locked",
        description: "You cannot switch to individual mode while running a live session. End the session first.",
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

  const handleDeclineLiveSession = () => {
    if (liveSession) {
      // Mark popup as handled to prevent it from showing again
      setPopupHandledSessionId(liveSession.id!);
    }
    setShowJoinModal(false);
    setLiveSession(null);
  };

  const handleReturnHome = () => {
    resetGame();
    setShowResultScreen(false);
    setSessionResult(null);
    setPopupHandledSessionId(null);
    setModeLocked(false); // Unlock mode when returning home
    localStorage.removeItem('lockMode');
    navigate('/');
  };

  const handlePlayAgain = () => {
    if (gameState.currentScenario) {
      resetGame();
      setShowResultScreen(false);
      setSessionResult(null);
      setPopupHandledSessionId(null);
      setModeLocked(false); // Unlock mode when playing again
      localStorage.removeItem('lockMode');
      setTimeout(() => {
        navigate('/');
        navigate('/game');
      }, 100);
    }
  };
  
  useEffect(() => {
    if (!isGameActive) {
      navigate('/');
    }
  }, [isGameActive, navigate]);

  // FIXED: Only set up classroom listener if classroomId is valid
  useEffect(() => {
    if (!currentUser || userRole !== 'student' || !classroomId) return;

    console.log("Setting up classroom membership listener for student:", currentUser.uid);
    
    const unsubscribe = onClassroomUpdated(classroomId, (classroom) => {
      console.log("Classroom updated:", classroom);
      
      // Prevent duplicate processing of the same classroom state
      if (lastProcessedClassroomData && 
          JSON.stringify(classroom.members) === JSON.stringify(lastProcessedClassroomData.members) &&
          JSON.stringify(classroom.students) === JSON.stringify(lastProcessedClassroomData.students)) {
        return;
      }
      
      setLastProcessedClassroomData(classroom);
      
      // Check membership in both arrays for compatibility
      const isMemberInMembers = classroom.members?.includes(currentUser.uid) || false;
      const isMemberInStudents = classroom.students?.some(student => student.id === currentUser.uid) || false;
      const isStillMember = isMemberInMembers || isMemberInStudents;
      
      console.log("Membership check:", { isMemberInMembers, isMemberInStudents, isStillMember });
      
      // FIXED: Only show removal message if student was actually in a live session
      if (!isStillMember && isInLiveSession) {
        console.log("Student removed from classroom during live session");
        setIsInLiveSession(false);
        setLiveSession(null);
        setHasVoted(false);
        setPopupHandledSessionId(null);
        setModeLocked(false); // Unlock mode when removed
        localStorage.removeItem('lockMode');
        
        toast({
          title: "Removed from Classroom",
          description: "You have been removed from this classroom by the teacher.",
          variant: "destructive",
        });
        
        setTimeout(() => {
          resetGame();
          navigate('/');
        }, 2000);
      }
    });

    return () => unsubscribe();
  }, [currentUser, classroomId, userRole, isInLiveSession, navigate, toast, resetGame, lastProcessedClassroomData]);

  useEffect(() => {
    if (!currentUser || userRole !== 'student') return;

    console.log("Setting up notification listener for student:", currentUser.uid);
    
    const unsubscribe = onNotificationsUpdated(currentUser.uid, (notifications) => {
      console.log("Received notifications:", notifications);
      const liveSessionNotification = notifications.find(n => n.type === 'live_session_started');
      
      if (liveSessionNotification && 
          !isInLiveSession && 
          liveSessionNotification.sessionId !== popupHandledSessionId) {
        console.log("Found new live session notification:", liveSessionNotification);
        setPendingSession(liveSessionNotification);
        setShowNotification(true);
      }
    });

    return () => unsubscribe();
  }, [currentUser, userRole, isInLiveSession, popupHandledSessionId]);

  const handleJoinFromNotification = useCallback(async () => {
    if (!pendingSession || !currentUser || !userProfile) return;

    setIsJoining(true);
    try {
      console.log("Joining live session from notification:", pendingSession.sessionId);
      
      // Mark popup as handled to prevent duplicates
      setPopupHandledSessionId(pendingSession.sessionId);
      
      setGameMode("classroom");
      
      const sessionData = await joinLiveSession(pendingSession.sessionId, currentUser.uid, userProfile.displayName || 'Student');
      
      if (sessionData && sessionData.status === 'active') {
        setLiveSession(sessionData);
        setIsInLiveSession(true);
        setModeLocked(true); // FIXED: Lock mode when joining session
        localStorage.setItem('lockMode', 'true');
        
        console.log("Auto-loading scenario:", sessionData.scenarioId);
        startScenario(sessionData.scenarioId);
        
        if (sessionData.currentSceneId) {
          setCurrentScene(sessionData.currentSceneId);
        }
        
        toast({
          title: "🎯 Joined Live Session!",
          description: `Connected to "${sessionData.scenarioTitle}" with ${sessionData.teacherName}`,
        });
      } else {
        throw new Error("Session is not active");
      }
      
      setShowNotification(false);
      setPendingSession(null);
    } catch (error) {
      console.error("Error joining live session from notification:", error);
      // Clear the handled session ID on error to allow retry
      setPopupHandledSessionId(null);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Unable to join the live session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  }, [pendingSession, currentUser, userProfile, setGameMode, startScenario, setCurrentScene, toast]);

  const handleDismissNotification = () => {
    if (pendingSession) {
      // Mark popup as handled to prevent it from showing again
      setPopupHandledSessionId(pendingSession.sessionId);
    }
    setShowNotification(false);
    setPendingSession(null);
  };

  // Show loading if no scenario is loaded
  if (!gameState.currentScenario) {
    return (
      <div className="container mx-auto px-4 py-6 md:py-8 animate-fade-in">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-300" />
            <p className="text-white/70">Loading scenario...</p>
          </div>
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
              {gameState.currentScenario?.title || 'Loading...'}
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
                disabled={(!classroomId && gameMode === "individual") || modeLocked || isInLiveSession || (userRole === 'teacher' && liveSession?.status === 'active')}
              >
                {(modeLocked || isInLiveSession || (userRole === 'teacher' && liveSession?.status === 'active')) && <Lock className="h-4 w-4 text-orange-400 mr-1" />}
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
            onAdvanceScene={() => {}} // Implement advance scene
            onEndSession={() => {}} // Implement end session
            isTeacher={true}
          />
        </div>
      )}

      {/* Main game content */}
      {gameState.currentScene?.isEnding ? (
        <ResultsSummary 
          gameState={gameState} 
          onPlayAgain={() => {}} // Implement play again
          onReturnHome={() => navigate('/')} 
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
        onClose={() => setShowJoinModal(false)}
        onJoin={() => {}} // Implement join
        onDecline={() => setShowJoinModal(false)}
        teacherName={liveSession?.teacherName || 'Teacher'}
        scenarioTitle={liveSession?.scenarioTitle || ''}
        participantCount={liveSession?.participants.length || 0}
      />
    </div>
  );
};

export default GamePage;
