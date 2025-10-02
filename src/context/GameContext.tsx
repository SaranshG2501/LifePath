import React, { createContext, useContext, useState, useEffect } from "react";
import { GameState, Scenario, Scene, Metrics, MetricChange, UserRole } from "@/types/game";
import { scenarios } from "@/data/scenarios";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { 
  updateUserProfile, 
  saveScenarioHistory, 
  ScenarioChoice 
} from "@/lib/firebase";
import { Timestamp } from "firebase/firestore";

type GameContextType = {
  gameState: GameState;
  scenarios: Scenario[];
  startScenario: (id: string) => void;
  makeChoice: (choiceId: string) => void;
  resetGame: () => void;
  isGameActive: boolean;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  showMirrorMoment: boolean;
  setShowMirrorMoment: (show: boolean) => void;
  currentMirrorQuestion: string | null;
  toggleMirrorMoments: () => void;
  mirrorMomentsEnabled: boolean;
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
  const [userRole, setUserRole] = useState<UserRole>("student");
  const [showMirrorMoment, setShowMirrorMoment] = useState<boolean>(false);
  const [currentMirrorQuestion, setCurrentMirrorQuestion] = useState<string | null>(null);
  const [mirrorMomentsEnabled, setMirrorMomentsEnabled] = useState<boolean>(true);
  const [scenarioChoices, setScenarioChoices] = useState<ScenarioChoice[]>([]);
  const { toast } = useToast();
  const { userProfile, currentUser, refreshUserProfile } = useAuth();

  // Set user role based on profile
  useEffect(() => {
    if (userProfile?.role) {
      setUserRole(userProfile.role as UserRole);
    } else {
      setUserRole("guest");
    }
  }, [userProfile]);

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

    const startingMetrics = { ...scenario.initialMetrics };
    setScenarioChoices([]);

    setGameState({
      currentScenario: scenario,
      currentScene: firstScene,
      metrics: startingMetrics,
      history: []
    });
    setIsGameActive(true);
    setShowMirrorMoment(false);
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

    // If mirror moments are enabled, show reflection question
    if (mirrorMomentsEnabled && !showMirrorMoment && Math.random() < 0.5) {
      const mirrorQuestions = [
        "Pause. Why did you choose that option?",
        "Would your real self make the same choice?",
        "How does this choice align with your values?",
        "What consequences do you think this will have?",
        "Is this what you would do in real life?"
      ];
      setCurrentMirrorQuestion(mirrorQuestions[Math.floor(Math.random() * mirrorQuestions.length)]);
      setShowMirrorMoment(true);
      return;
    }

    // Calculate new metrics - create a copy to prevent mutation
    const newMetrics = { ...gameState.metrics };
    
    // Process each metric change
    if (choice.metricChanges) {
      Object.entries(choice.metricChanges).forEach(([key, value]) => {
        const metricKey = key as keyof Metrics;
        // Check if the key exists in our metrics object
        if (newMetrics.hasOwnProperty(metricKey) && typeof value === 'number') {
          // Ensure we stay within 0-100 range
          newMetrics[metricKey] = Math.max(0, Math.min(100, newMetrics[metricKey] + value));
        }
      });
    }

    // Removed debug log for cleaner console

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

    // Save choice to scenario choices for Firestore
    let newChoice: ScenarioChoice | null = null;
    if (currentUser) {
      newChoice = {
        sceneId: gameState.currentScene.id,
        choiceId: choice.id,
        choiceText: choice.text,
        timestamp: Timestamp.now(),
        metricChanges: choice.metricChanges
      };
      
      setScenarioChoices(prev => [...prev, newChoice as ScenarioChoice]);
    }

    const updatedGameState = {
      ...gameState,
      currentScene: nextScene,
      metrics: newMetrics,
      history: [...gameState.history, newHistoryEntry]
    };

    setGameState(updatedGameState);

    // If user is logged in, update their metrics in their profile
    if (currentUser) {
      updateUserProfile(currentUser.uid, { 
        metrics: newMetrics
      }).catch(error => {
        console.error("Error updating user metrics:", error);
      });
    }

    // Check if this is the end of the scenario
    if ((nextScene.isEndScene || nextScene.isEnding) && currentUser && gameState.currentScenario && newChoice) {
      const allChoices = [...scenarioChoices, newChoice];
      
      // Save completed scenario to Firestore
      saveScenarioHistory(
        currentUser.uid,
        gameState.currentScenario.id,
        gameState.currentScenario.title,
        allChoices,
        newMetrics
      ).then(() => {
        // Scenario history saved successfully
        toast({
          title: "Scenario Completed",
          description: "Your choices have been saved to your profile.",
        });
        
        // Force refresh user profile to update history
        setTimeout(() => {
          refreshUserProfile();
        }, 1000);
      }).catch(error => {
        console.error("Error saving scenario history:", error);
        toast({
          title: "Save Error",
          description: "Failed to save your progress. Please check your connection.",
          variant: "destructive",
        });
      });
    }

    // Reset mirror moment state
    setShowMirrorMoment(false);
    
    // Removed the metrics changes toast
  };

  const resetGame = () => {
    setGameState(initialGameState);
    setIsGameActive(false);
    setShowMirrorMoment(false);
    setScenarioChoices([]);
  };

  const toggleMirrorMoments = () => {
    setMirrorMomentsEnabled(!mirrorMomentsEnabled);
    toast({
      title: `Mirror Moments ${!mirrorMomentsEnabled ? 'Enabled' : 'Disabled'}`,
      description: !mirrorMomentsEnabled 
        ? "You'll now receive reflection prompts during gameplay." 
        : "You won't receive reflection prompts during gameplay.",
    });
  };

  return (
    <GameContext.Provider
      value={{
        gameState,
        scenarios,
        startScenario,
        makeChoice,
        resetGame,
        isGameActive,
        userRole,
        setUserRole,
        showMirrorMoment,
        setShowMirrorMoment,
        currentMirrorQuestion,
        toggleMirrorMoments,
        mirrorMomentsEnabled
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
