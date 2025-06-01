import React, { useEffect, useState } from 'react';
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
import { Sparkles, Loader2, Users, User, ToggleLeft, ToggleRight, Wifi, Lock } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  LiveSession, 
  SessionParticipant, 
  onLiveSessionUpdated, 
  joinLiveSession, 
  submitLiveChoice,
  advanceLiveSession,
  endLiveSession,
  getActiveSession
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
    setCurrentScene
  } = useGameContext();
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  const [liveSession, setLiveSession] = useState<LiveSession | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [isInLiveSession, setIsInLiveSession] = useState(false);

  useEffect(() => {
    // If no active game, redirect to home
    if (!isGameActive) {
      navigate('/');
    }
  }, [isGameActive, navigate]);
  
  // Check for active live sessions when in classroom mode (for students)
  useEffect(() => {
    let checkInterval: NodeJS.Timeout;
    
    const checkActiveSession = async () => {
      if (gameMode === "classroom" && classroomId && userRole === "student" && !isInLiveSession) {
        try {
          const activeSession = await getActiveSession(classroomId);
          if (activeSession && !isInLiveSession) {
            console.log("Active session found:", activeSession);
            setLiveSession(activeSession);
            setShowJoinModal(true);
          }
        } catch (error) {
          console.error("Error checking active session:", error);
        }
      }
    };

    if (gameMode === "classroom" && userRole === "student") {
      // Check immediately
      checkActiveSession();
      
      // Then check every 3 seconds for new sessions
      checkInterval = setInterval(checkActiveSession, 3000);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [gameMode, classroomId, userRole, isInLiveSession]);

  // Listen to live session updates for real-time sync
  useEffect(() => {
    if (liveSession?.id && isInLiveSession) {
      console.log("Setting up live session listener for:", liveSession.id);
      
      const unsubscribe = onLiveSessionUpdated(liveSession.id, (updatedSession) => {
        console.log("Live session updated:", updatedSession);
        setLiveSession(updatedSession);
        
        // Sync scene with teacher's current scene
        if (updatedSession.currentSceneId && gameState.currentScene?.id !== updatedSession.currentSceneId) {
          console.log("Syncing to teacher's scene:", updatedSession.currentSceneId);
          setCurrentScene(updatedSession.currentSceneId);
        }
        
        // If session ended, clean up
        if (!updatedSession.isActive) {
          setIsInLiveSession(false);
          setLiveSession(null);
          toast({
            title: "Session Ended",
            description: "The live session has been ended by the teacher.",
          });
        }
      });

      return unsubscribe;
    }
  }, [liveSession?.id, isInLiveSession, gameState.currentScene?.id, setCurrentScene, toast]);

  const handleJoinLiveSession = async () => {
    if (!liveSession || !currentUser || !userProfile) return;

    try {
      console.log("Joining live session:", liveSession.id);
      await joinLiveSession(liveSession.id!, currentUser.uid, userProfile.displayName || 'Student');
      setIsInLiveSession(true);
      setShowJoinModal(false);
      
      // Sync to the current scene of the session
      if (liveSession.currentSceneId) {
        setCurrentScene(liveSession.currentSceneId);
      }
      
      toast({
        title: "Joined Live Session",
        description: `You're now part of the live session for "${liveSession.scenarioTitle}"`,
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

  const handleDeclineLiveSession = () => {
    setShowJoinModal(false);
    setLiveSession(null);
  };

  const handleLiveChoice = async (choiceId: string) => {
    if (liveSession?.id && currentUser) {
      try {
        console.log("Submitting live choice:", choiceId);
        await submitLiveChoice(liveSession.id, currentUser.uid, choiceId);
        toast({
          title: "Choice Submitted",
          description: "Your choice has been recorded. Waiting for other students...",
        });
      } catch (error) {
        console.error("Error submitting live choice:", error);
        toast({
          title: "Error",
          description: "Failed to submit your choice. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleAdvanceScene = async (nextSceneId: string) => {
    if (liveSession?.id) {
      try {
        console.log("Advancing live session to scene:", nextSceneId);
        await advanceLiveSession(liveSession.id, nextSceneId);
        // Also advance the local game state
        makeChoice('advance');
      } catch (error) {
        console.error("Error advancing scene:", error);
      }
    }
  };

  const handleEndLiveSession = async () => {
    if (liveSession?.id && classroomId) {
      try {
        await endLiveSession(liveSession.id, classroomId);
        setIsInLiveSession(false);
        setLiveSession(null);
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
    navigate('/');
  };

  const handlePlayAgain = () => {
    if (gameState.currentScenario) {
      resetGame();
      setTimeout(() => {
        navigate('/');
        navigate('/game');
      }, 100);
    }
  };
  
  const toggleGameMode = () => {
    // Prevent mode switching during live session
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
                  <Wifi className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-green-400">Live</span>
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
                disabled={(!classroomId && gameMode === "individual") || isInLiveSession}
              >
                {isInLiveSession && <Lock className="h-4 w-4 text-orange-400 mr-1" />}
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
        teacherName={userProfile?.displayName || 'Teacher'}
        scenarioTitle={liveSession?.scenarioTitle || ''}
        participantCount={liveSession?.participants.length || 0}
      />
    </div>
  );
};

export default GamePage;
