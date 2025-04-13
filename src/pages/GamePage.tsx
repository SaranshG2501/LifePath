
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameContext } from '@/context/GameContext';
import SceneDisplay from '@/components/SceneDisplay';
import MetricsDisplay from '@/components/MetricsDisplay';
import ResultsSummary from '@/components/ResultsSummary';
import MirrorMoment from '@/components/MirrorMoment';
import ClassroomVoting from '@/components/ClassroomVoting';
import { Sparkles, Loader2, Users, User, ToggleLeft, ToggleRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';

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
    mirrorMomentsEnabled,
    toggleMirrorMoments
  } = useGameContext();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    // If no active game, redirect to home
    if (!isGameActive) {
      navigate('/');
    }
  }, [isGameActive, navigate]);

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

  if (!gameState.currentScenario || !gameState.currentScene) {
    return (
      <div className="container mx-auto px-4 py-8 text-center flex justify-center items-center min-h-[50vh]">
        <div className="glassmorphic-card p-8 animate-pulse flex flex-col items-center gap-4 max-w-md w-full">
          <div className="relative">
            <Sparkles className="text-primary h-10 w-10 animate-float" />
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
          </div>
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-white text-lg">Loading your adventure...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 animate-fade-in">
      {/* Header with scenario title, mode and metrics */}
      <div className="mb-6 md:mb-8">
        <div className="glass-card">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <h1 className="text-xl md:text-2xl font-bold gradient-heading flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              {gameState.currentScenario.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-1 border-primary/20 bg-black/20 text-white hover:bg-primary/10"
                onClick={toggleMirrorMoments}
              >
                {mirrorMomentsEnabled ? (
                  <ToggleRight className="h-4 w-4 text-primary" />
                ) : (
                  <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                )}
                Mirror Moments
              </Button>
              
              {gameMode === "individual" ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1 border-primary/20 bg-black/20 text-white hover:bg-primary/10"
                  onClick={() => setGameMode("classroom")}
                  disabled={userRole === "guest"}
                >
                  <User className="h-4 w-4 text-muted-foreground" />
                  Individual Mode
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1 border-primary/20 bg-black/20 text-white hover:bg-primary/10"
                  onClick={() => setGameMode("individual")}
                >
                  <Users className="h-4 w-4 text-primary" />
                  Classroom Mode
                </Button>
              )}
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
        <ClassroomVoting scene={gameState.currentScene} />
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
