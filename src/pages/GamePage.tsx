
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameContext } from '@/context/GameContext';
import SceneDisplay from '@/components/SceneDisplay';
import MetricsDisplay from '@/components/MetricsDisplay';
import ResultsSummary from '@/components/ResultsSummary';
import MirrorMoment from '@/components/MirrorMoment';
import EnhancedClassroomVoting from '@/components/EnhancedClassroomVoting';
import { Sparkles, Loader2, Users, User, ToggleLeft, ToggleRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

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
    toggleMirrorMoments
  } = useGameContext();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toast } = useToast();

  useEffect(() => {
    // If no active game, redirect to home
    if (!isGameActive) {
      navigate('/');
    }
  }, [isGameActive, navigate]);
  
  // Prevent using classroom mode without joining a classroom
  useEffect(() => {
    if (gameMode === "classroom" && !classroomId) {
      toast({
        title: "Classroom Required",
        description: userRole === 'teacher' 
          ? "Please create a classroom before starting a scenario in classroom mode." 
          : "Please join a classroom before starting a scenario in classroom mode.",
        variant: "destructive",
      });
      setGameMode("individual");
    }
  }, [gameMode, classroomId, userRole, toast, setGameMode]);

  const handleChoiceMade = (choiceId: string) => {
    makeChoice(choiceId);
  };

  const handleReturnHome = () => {
    resetGame();
    navigate('/');
  };

  const handlePlayAgain = () => {
    if (gameState.currentScenario) {
      resetGame();
      // Need to wait for reset before starting new scenario
      setTimeout(() => {
        navigate('/');
        navigate('/game');
      }, 100);
    }
  };
  
  const toggleGameMode = () => {
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
        <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 p-8 rounded-xl animate-pulse flex flex-col items-center gap-4 max-w-md w-full border border-white/10 shadow-lg">
          <div className="relative">
            <Sparkles className="text-blue-300 h-10 w-10 animate-float" />
            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
          </div>
          <Loader2 className="h-8 w-8 text-blue-300 animate-spin" />
          <p className="text-white text-lg">Loading your adventure...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 animate-fade-in">
      {/* Header with scenario title, mode and metrics */}
      <div className="mb-6 md:mb-8">
        <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-xl p-4 border border-white/10 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-300 animate-pulse" />
              {gameState.currentScenario.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-1 border-blue-300/20 bg-black/20 text-white hover:bg-blue-900/20"
                onClick={toggleMirrorMoments}
              >
                {mirrorMomentsEnabled ? (
                  <ToggleRight className="h-4 w-4 text-blue-300" />
                ) : (
                  <ToggleLeft className="h-4 w-4 text-white/50" />
                )}
                Mirror Moments
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-1 border-blue-300/20 bg-black/20 text-white hover:bg-blue-900/20"
                onClick={toggleGameMode}
                disabled={!classroomId && gameMode === "individual"}
              >
                {gameMode === "classroom" ? (
                  <>
                    <Users className="h-4 w-4 text-blue-300" />
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

      {/* Main game content */}
      {gameState.currentScene.isEnding ? (
        <ResultsSummary 
          gameState={gameState} 
          onPlayAgain={handlePlayAgain} 
          onReturnHome={handleReturnHome} 
        />
      ) : showMirrorMoment ? (
        <MirrorMoment />
      ) : gameMode === "classroom" ? (
        <EnhancedClassroomVoting scene={gameState.currentScene} />
      ) : (
        <SceneDisplay 
          scene={gameState.currentScene} 
          onChoiceMade={handleChoiceMade} 
        />
      )}
    </div>
  );
};

export default GamePage;
