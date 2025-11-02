
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
import LiveSessionTracker from '@/components/classroom/LiveSessionTracker';
import { Sparkles, Loader2, Users, User, ToggleLeft, ToggleRight, Wifi, Lock, Radio } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { 
  LiveSession, 
  onLiveSessionUpdated, 
  joinLiveSession, 
  submitLiveChoice,
  advanceLiveSession,
  endLiveSession,
  getActiveSession,
  onClassroomUpdated
} from '@/lib/firebase';
import FloatingElements from '@/components/FloatingElements';

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
    syncMirrorMomentsFromSession
  } = useGameContext();
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  const [liveSession, setLiveSession] = useState<LiveSession | null>(null);
  const [isInLiveSession, setIsInLiveSession] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [showResultScreen, setShowResultScreen] = useState(false);
  const [sessionResult, setSessionResult] = useState<any>(null);

  useEffect(() => {
    if (!isGameActive) {
      navigate('/');
    }
  }, [isGameActive, navigate]);

  // Enhanced live session listener
  useEffect(() => {
    if (liveSession?.id && isInLiveSession) {
      
      const unsubscribe = onLiveSessionUpdated(liveSession.id, (updatedSession) => {
        setLiveSession(updatedSession);
        
        // Immediate session end handling
        if (updatedSession.status === 'ended') {
          setIsInLiveSession(false);
          setHasVoted(false);
          setLiveSession(null);
          
          // Show modal and navigate away for students
          if (userRole === 'student') {
            // Reset game state to kick student out of scenario
            resetGame();
            
            toast({
              title: "Session Ended",
              description: "The teacher has ended this live session. Returning to home...",
              duration: 3000,
            });
            
            // Navigate away after a short delay
            setTimeout(() => {
              navigate('/');
            }, 2000);
          } else if (updatedSession.resultPayload) {
            setSessionResult(updatedSession.resultPayload);
            setShowResultScreen(true);
          } else {
            toast({
              title: "Session Ended",
              description: "The live session has been ended.",
            });
            navigate('/');
          }
          return;
        }
        
        // Real-time scene synchronization for students
        if (userRole === 'student' && 
            updatedSession.currentSceneId && 
            gameState.currentScene?.id !== updatedSession.currentSceneId) {
          setCurrentScene(updatedSession.currentSceneId);
          
          // Important: Reset hasVoted BEFORE checking currentChoices
          setHasVoted(false);
          
          toast({
            title: "Scene Updated",
            description: "Your teacher has advanced to the next scene.",
          });
        }

        // Sync mirror moments setting for students
        if (userRole === 'student' && updatedSession.mirrorMomentsEnabled !== undefined) {
          syncMirrorMomentsFromSession(updatedSession.mirrorMomentsEnabled);
        }
        
        // Check if current user has voted for the CURRENT scene
        // This must run after scene synchronization to avoid race conditions
        if (currentUser && updatedSession.currentChoices?.[currentUser.uid]) {
          setHasVoted(true);
        } else if (currentUser) {
          // Explicitly set to false if no vote found
          setHasVoted(false);
        }
      });

      return unsubscribe;
    }
  }, [liveSession?.id, isInLiveSession, gameState.currentScene?.id, setCurrentScene, currentUser, toast, userRole]);

  // Enhanced live choice submission
  const handleLiveChoice = async (choiceId: string) => {
    if (liveSession?.id && currentUser && !hasVoted) {
      try {
        setHasVoted(true);
        
        await submitLiveChoice(liveSession.id, currentUser.uid, choiceId, gameState.currentScene?.id);
        
        toast({
          title: "✅ Choice Submitted",
          description: "Your decision has been recorded successfully!",
        });
      } catch (error) {
        console.error("Error submitting live choice:", error);
        setHasVoted(false);
        toast({
          title: "Submission Error",
          description: "Failed to record your choice. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  // Enhanced scene advancement
  const handleAdvanceScene = async (nextSceneId: string) => {
    if (liveSession?.id) {
      try {
        
        let nextSceneIndex;
        if (gameState.currentScenario) {
          const nextIndex = gameState.currentScenario.scenes.findIndex(s => s.id === nextSceneId);
          if (nextIndex >= 0) {
            nextSceneIndex = nextIndex;
          }
        }
        
        // Reset votes when advancing
        setHasVoted(false);
        
        await advanceLiveSession(liveSession.id, nextSceneId, nextSceneIndex);
        makeChoice('advance', true); // Skip mirror moments during live sessions
        
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
    navigate('/');
  };

  const handlePlayAgain = () => {
    if (gameState.currentScenario) {
      resetGame();
      setShowResultScreen(false);
      setSessionResult(null);
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

  const handleToggleMirrorMoments = () => {
    // Prevent anyone from changing mirror mode during live sessions
    if (isInLiveSession) {
      toast({
        title: "Setting Locked",
        description: "Mirror moments cannot be changed during an active live session.",
        variant: "destructive",
      });
      return;
    }
    
    toggleMirrorMoments();
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
    <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-6 md:py-8 animate-fade-in relative">
      <FloatingElements count={15} variant="sparse" />
      {/* Header with scenario title, mode and metrics */}
      <div className="mb-4 sm:mb-6 md:mb-8 relative z-10">
        <div className="bg-gradient-to-br from-card/60 to-card/40 rounded-2xl p-3 sm:p-4 border-2 border-primary/30 shadow-2xl backdrop-blur-xl hover-lift">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent flex items-center gap-2 flex-wrap">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-300" />
              <span className="break-words">{gameState.currentScenario.title}</span>
              {isInLiveSession && (
                <div className="flex items-center gap-1">
                  <Wifi className="h-3 w-3 sm:h-4 sm:w-4 text-green-400 animate-pulse" />
                  <Badge className="bg-green-500/20 text-green-300 border-0 text-xs">
                    <Radio className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                    Live
                  </Badge>
                </div>
              )}
            </h1>
            
            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className={`flex items-center gap-1 border-indigo-300/20 bg-black/20 text-white hover:bg-indigo-900/20 text-xs sm:text-sm px-2 sm:px-3 ${
                  isInLiveSession ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={handleToggleMirrorMoments}
                disabled={isInLiveSession}
              >
                {isInLiveSession && <Lock className="h-3 w-3 sm:h-4 sm:w-4 text-orange-400 mr-1" />}
                {mirrorMomentsEnabled ? (
                  <ToggleRight className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-300" />
                ) : (
                  <ToggleLeft className="h-3 w-3 sm:h-4 sm:w-4 text-white/50" />
                )}
                <span className="hidden sm:inline">Mirror Moments</span>
                <span className="sm:hidden">Mirror</span>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-1 border-indigo-300/20 bg-black/20 text-white hover:bg-indigo-900/20 text-xs sm:text-sm px-2 sm:px-3"
                onClick={toggleGameMode}
                disabled={(!classroomId && gameMode === "individual") || isInLiveSession || (userRole === 'teacher' && liveSession?.status === 'active')}
              >
                {(isInLiveSession || (userRole === 'teacher' && liveSession?.status === 'active')) && <Lock className="h-3 w-3 sm:h-4 sm:w-4 text-orange-400 mr-1" />}
                {gameMode === "classroom" ? (
                  <>
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-300" />
                    <span className="hidden sm:inline">Classroom Mode</span>
                    <span className="sm:hidden">Classroom</span>
                  </>
                ) : (
                  <>
                    <User className="h-3 w-3 sm:h-4 sm:w-4 text-white/50" />
                    <span className="hidden sm:inline">Individual Mode</span>
                    <span className="sm:hidden">Individual</span>
                  </>
                )}
              </Button>
            </div>
          </div>
          <MetricsDisplay metrics={gameState.metrics} compact={isMobile} />
        </div>
      </div>

      {/* Live Session Tracker for Teachers and Students */}
      {isInLiveSession && liveSession && (
        <div className="mb-4 sm:mb-6">
          <LiveSessionTracker
            session={liveSession}
            onAdvanceScene={handleAdvanceScene}
            onEndSession={handleEndLiveSession}
            isTeacher={userRole === 'teacher'}
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
      ) : (showMirrorMoment && liveSession?.mirrorMomentsEnabled !== false) ? (
        <MirrorMoment />
      ) : isInLiveSession ? (
        <SceneDisplay 
          key={gameState.currentScene.id}
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
          key={gameState.currentScene.id}
          scene={gameState.currentScene} 
          onChoiceMade={handleChoiceMade} 
        />
      )}
    </div>
  );
};

export default GamePage;
