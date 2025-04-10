
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameContext } from '@/context/GameContext';
import SceneDisplay from '@/components/SceneDisplay';
import MetricsDisplay from '@/components/MetricsDisplay';
import ResultsSummary from '@/components/ResultsSummary';

const GamePage = () => {
  const { gameState, makeChoice, resetGame, isGameActive } = useGameContext();
  const navigate = useNavigate();

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
      const scenarioId = gameState.currentScenario.id;
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
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Loading scenario...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with scenario title and metrics */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">{gameState.currentScenario.title}</h1>
        <MetricsDisplay metrics={gameState.metrics} compact={true} />
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
