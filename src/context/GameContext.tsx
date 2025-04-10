
import React, { createContext, useContext, useState, useEffect } from "react";
import { GameState, Scenario, Scene, Metrics, MetricChange } from "@/types/game";
import { scenarios } from "@/data/scenarios";
import { useToast } from "@/components/ui/use-toast";

type GameContextType = {
  gameState: GameState;
  scenarios: Scenario[];
  startScenario: (id: string) => void;
  makeChoice: (choiceId: string) => void;
  resetGame: () => void;
  isGameActive: boolean;
};

const initialMetrics: Metrics = {
  health: 0,
  money: 0,
  happiness: 0,
  knowledge: 0,
  relationships: 0
};

const initialGameState: GameState = {
  currentScenario: null,
  currentScene: null,
  metrics: initialMetrics,
  history: []
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [isGameActive, setIsGameActive] = useState<boolean>(false);
  const { toast } = useToast();

  const startScenario = (id: string) => {
    const scenario = scenarios.find((s) => s.id === id);
    
    if (!scenario) {
      toast({
        title: "Error",
        description: "Scenario not found",
        variant: "destructive",
      });
      return;
    }

    const firstScene = scenario.scenes.find((s) => s.id === "start");
    
    if (!firstScene) {
      toast({
        title: "Error",
        description: "Starting scene not found",
        variant: "destructive",
      });
      return;
    }

    setGameState({
      currentScenario: scenario,
      currentScene: firstScene,
      metrics: { ...scenario.initialMetrics },
      history: []
    });
    setIsGameActive(true);
  };

  const makeChoice = (choiceId: string) => {
    if (!gameState.currentScene || !gameState.currentScenario) return;

    const choice = gameState.currentScene.choices.find(
      (c) => c.id === choiceId
    );
    
    if (!choice) {
      toast({
        title: "Error",
        description: "Choice not found",
        variant: "destructive",
      });
      return;
    }

    // Calculate new metrics
    const newMetrics = { ...gameState.metrics };
    Object.entries(choice.metricChanges).forEach(([key, value]) => {
      const metricKey = key as keyof Metrics;
      if (value) {
        newMetrics[metricKey] = Math.max(0, Math.min(100, newMetrics[metricKey] + value));
      }
    });

    // Find the next scene
    const nextScene = gameState.currentScenario.scenes.find(
      (s) => s.id === choice.nextSceneId
    );
    
    if (!nextScene) {
      toast({
        title: "Error",
        description: "Next scene not found",
        variant: "destructive",
      });
      return;
    }

    // Update history
    const newHistoryEntry = {
      sceneId: gameState.currentScene.id,
      choiceId,
      metricChanges: choice.metricChanges
    };

    setGameState({
      ...gameState,
      currentScene: nextScene,
      metrics: newMetrics,
      history: [...gameState.history, newHistoryEntry]
    });

    // Show metrics changes toast
    const metricChangesText = Object.entries(choice.metricChanges)
      .filter(([_, value]) => value !== 0)
      .map(([key, value]) => {
        const sign = value && value > 0 ? '+' : '';
        return `${key.charAt(0).toUpperCase() + key.slice(1)}: ${sign}${value}`;
      })
      .join(', ');

    if (metricChangesText) {
      toast({
        title: "Your stats have changed",
        description: metricChangesText,
      });
    }
  };

  const resetGame = () => {
    setGameState(initialGameState);
    setIsGameActive(false);
  };

  return (
    <GameContext.Provider
      value={{
        gameState,
        scenarios,
        startScenario,
        makeChoice,
        resetGame,
        isGameActive
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGameContext must be used within a GameProvider");
  }
  return context;
};
