
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
  getDoc,
  doc,
  db
} from '@/lib/firebase';

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
  const [sceneAdvanceDebounce, setSceneAdvanceDebounce] = useState(false);
  const [lastProcessedClassroomData, setLastProcessedClassroomData] = useState<Classroom | null>(null);

  useEffect(() => {
    if (!isGameActive) {
      navigate('/');
    }
  }, [isGameActive, navigate]);

  // Fixed classroom membership listener with proper state management
  useEffect(() => {
    if (!currentUser || !classroomId || userRole !== 'student') return;

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
      
      if (!isStillMember && isInLiveSession) {
        console.log("Student removed from classroom during live session");
        setIsInLiveSession(false);
        setLiveSession(null);
        setHasVoted(false);
        setPopupHandledSessionId(null);
        
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

  // Enhanced notification listener with duplicate prevention
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
  
  // Enhanced active session detection with classroom authority
  useEffect(() => {
    let checkInterval: NodeJS.Timeout;
    
    const checkActiveSession = async () => {
      if (gameMode === "classroom" && classroomId && userRole === "student" && !isInLiveSession) {
        try {
          // Use classroom's activeSessionId as authoritative source
          const classroomDoc = await getDoc(doc(db, 'classrooms', classroomId));
          if (classroomDoc.exists()) {
            const classroomData = classroomDoc.data() as Classroom;
            
            if (classroomData.activeSessionId && 
                classroomData.activeSessionId !== popupHandledSessionId) {
              
              const activeSession = await getActiveSession(classroomId);
              if (activeSession && activeSession.status === 'active') {
                console.log("Active session found via classroom:", activeSession);
                setLiveSession(activeSession);
                setShowJoinModal(true);
              }
            }
          }
        } catch (error) {
          console.error("Error checking active session:", error);
        }
      }
    };

    if (gameMode === "classroom" && userRole === "student") {
      checkActiveSession();
      checkInterval = setInterval(checkActiveSession, 5000); // Check every 5 seconds
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [gameMode, classroomId, userRole, isInLiveSession, popupHandledSessionId]);

  // Enhanced live session listener with better sync and cleanup
  useEffect(() => {
    if (liveSession?.id && isInLiveSession) {
      console.log("Setting up live session listener for:", liveSession.id);
      
      const unsubscribe = onLiveSessionUpdated(liveSession.id, (updatedSession) => {
        console.log("Live session updated:", updatedSession);
        setLiveSession(updatedSession);
        
        // Check if session ended
        if (updatedSession.status === 'ended') {
          console.log("Session ended, showing results");
          setIsInLiveSession(false);
          setHasVoted(false);
          setPopupHandledSessionId(null); // Clear to allow new sessions
          
          // Show result screen if result payload exists
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
        
        // Enhanced Scene Progress Sync
        if (updatedSession.currentSceneId && 
            gameState.currentScene?.id !== updatedSession.currentSceneId &&
            !sceneAdvanceDebounce) {
          console.log("Syncing to teacher's scene:", updatedSession.currentSceneId);
          setSceneAdvanceDebounce(true);
          setCurrentScene(updatedSession.currentSceneId);
          setHasVoted(false); // Reset vote status for new scene
          
          // Clear debounce after a short delay
          setTimeout(() => setSceneAdvanceDebounce(false), 1000);
        }
        
        // Check if user has voted on current scene
        if (currentUser && updatedSession.currentChoices?.[currentUser.uid]) {
          setHasVoted(true);
        } else {
          setHasVoted(false);
        }
      });

      return unsubscribe;
    }
  }, [liveSession?.id, isInLiveSession, gameState.currentScene?.id, setCurrentScene, currentUser, toast, sceneAdvanceDebounce]);

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

  const handleJoinLiveSession = async () => {
    if (!liveSession || !currentUser || !userProfile) return;

    setIsJoining(true);
    try {
      console.log("Joining live session:", liveSession.id);
      
      // Mark popup as handled to prevent duplicates
      setPopupHandledSessionId(liveSession.id!);
      
      const sessionData = await joinLiveSession(liveSession.id!, currentUser.uid, userProfile.displayName || 'Student');
      
      if (sessionData.status === 'active') {
        setIsInLiveSession(true);
        setShowJoinModal(false);
        
        startScenario(liveSession.scenarioId);
        
        if (liveSession.currentSceneId) {
          setCurrentScene(liveSession.currentSceneId);
        }
        
        toast({
          title: "🎯 Joined Live Session!",
          description: `Connected to "${liveSession.scenarioTitle}" with ${liveSession.teacherName}`,
        });
      } else {
        throw new Error("Session is not active");
      }
    } catch (error) {
      console.error("Error joining live session:", error);
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
  };

  const handleDeclineLiveSession = () => {
    if (liveSession) {
      // Mark popup as handled to prevent it from showing again
      setPopupHandledSessionId(liveSession.id!);
    }
    setShowJoinModal(false);
    setLiveSession(null);
  };

  const handleLiveChoice = async (choiceId: string) => {
    if (liveSession?.id && currentUser && !hasVoted) {
      try {
        console.log("Submitting live choice:", choiceId);
        setHasVoted(true); // Optimistic update
        
        await submitLiveChoice(liveSession.id, currentUser.uid, choiceId, gameState.currentScene?.id);
        toast({
          title: "✅ Choice Submitted",
          description: "Your decision has been recorded. Waiting for classmates...",
        });
      } catch (error) {
        console.error("Error submitting live choice:", error);
        setHasVoted(false); // Revert optimistic update
        toast({
          title: "Submission Error",
          description: "Failed to record your choice. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleAdvanceScene = async (nextSceneId: string) => {
    if (liveSession?.id && !sceneAdvanceDebounce) {
      try {
        console.log("Advancing live session to scene:", nextSceneId);
        setSceneAdvanceDebounce(true);
        
        // Calculate next scene index if we have current scene info
        let nextSceneIndex;
        if (gameState.currentScenario) {
          const currentIndex = gameState.currentScenario.scenes.findIndex(s => s.id === gameState.currentScene?.id);
          const nextIndex = gameState.currentScenario.scenes.findIndex(s => s.id === nextSceneId);
          if (nextIndex >= 0) {
            nextSceneIndex = nextIndex;
          }
        }
        
        await advanceLiveSession(liveSession.id, nextSceneId, nextSceneIndex);
        makeChoice('advance');
        
        // Clear debounce after operation completes
        setTimeout(() => setSceneAdvanceDebounce(false), 1000);
      } catch (error) {
        console.error("Error advancing scene:", error);
        setSceneAdvanceDebounce(false);
      }
    }
  };

  const handleEndLiveSession = async () => {
    if (liveSession?.id && classroomId) {
      try {
        // Create result payload
        const resultPayload = {
          choices: liveSession.currentChoices || {},
          metrics: gameState.metrics,
          summary: `Session completed for "${liveSession.scenarioTitle}"`
        };
        
        await endLiveSession(liveSession.id, classroomId, resultPayload);
        setIsInLiveSession(false);
        setLiveSession(null);
        setHasVoted(false);
        setPopupHandledSessionId(null); // Clear to allow new sessions
        
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
    setPopupHandledSessionId(null); // Clear session tracking
    navigate('/');
  };

  const handlePlayAgain = () => {
    if (gameState.currentScenario) {
      resetGame();
      setShowResultScreen(false);
      setSessionResult(null);
      setPopupHandledSessionId(null); // Clear session tracking
      setTimeout(() => {
        navigate('/');
        navigate('/game');
      }, 100);
    }
  };
  
  const toggleGameMode = () => {
    // Role Lock: Prevent teacher from switching mode if they have an active session
    if (userRole === 'teacher' && liveSession && liveSession.status === 'active') {
      toast({
        title: "Mode Locked",
        description: "You cannot switch to individual mode while running a live session. End the session first.",
        variant: "destructive",
      });
      return;
    }

    if (isInLiveSession) {
      toast({
        title: "Mode Locked",
        description: "You cannot change modes during a live session. Exit the session first.",
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

  // Show result screen if session ended with results
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

      {/* Session Notification Modal */}
      <NotificationModal
        isOpen={showNotification}
        onClose={handleDismissNotification}
        onJoin={handleJoinFromNotification}
        onDismiss={handleDismissNotification}
        teacherName={pendingSession?.teacherName || 'Teacher'}
        scenarioTitle={pendingSession?.scenarioTitle || ''}
        isJoining={isJoining}
      />
    </div>
  );
};

export default GamePage;
