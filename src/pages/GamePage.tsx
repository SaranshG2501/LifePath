
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameContext } from '@/context/GameContext';
import SceneDisplay from '@/components/SceneDisplay';
import MetricsDisplay from '@/components/MetricsDisplay';
import ResultsSummary from '@/components/ResultsSummary';
import { Sparkles, Loader2, AlertTriangle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const GamePage = () => {
  const { gameState, makeChoice, resetGame, isGameActive } = useGameContext();
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
      {/* Header with scenario title and metrics */}
      <div className="mb-6 md:mb-8">
        <div className="glass-card">
          <h1 className="text-xl md:text-2xl font-bold mb-4 gradient-heading flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            {gameState.currentScenario.title}
          </h1>
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
