
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Metrics, Scenario, Scene, Choice } from '@/types/game';
import { scenarios } from '@/data/scenarios';
import { awardBadge, saveScenarioHistory, recordStudentVote, onVotesUpdated } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface GameState {
  currentScenario: Scenario | null;
  currentScene: Scene | null;
  metrics: Metrics;
  choices: {
    sceneId: string;
    choiceId: string;
    text?: string;
    timestamp: Date;
    metricChanges?: Record<string, number>;
  }[];
  isActive: boolean;
  startTime: Date | null;
}

interface SceneHistoryEntry {
  sceneId: string;
  timestamp: Date;
  metrics: Metrics;
  choiceId?: string;
  choiceText?: string;
}

const initialMetrics: Metrics = {
  health: 50,
  money: 50,
  happiness: 50,
  knowledge: 50,
  relationships: 50
};

const initialGameState: GameState = {
  currentScenario: null,
  currentScene: null,
  metrics: initialMetrics,
  choices: [],
  isActive: false,
  startTime: null
};

interface GameContextProps {
  gameState: GameState;
  sceneHistory: SceneHistoryEntry[];
  makeChoice: (choiceId: string) => void;
  resetGame: () => void;
  startScenario: (scenarioId: string) => void;
  isGameActive: boolean;
  mirrorMomentsEnabled: boolean;
  toggleMirrorMoments: () => void;
  showMirrorMoment: boolean;
  setShowMirrorMoment: (show: boolean) => void;
  userRole: string;
  gameMode: 'individual' | 'classroom';
  setGameMode: (mode: 'individual' | 'classroom') => void;
  classroomId: string | null;
  setClassroomId: (classroomId: string | null) => void;
  classroomVotes: any[];
  setClassroomVotes: (votes: any[]) => void;
  revealVotes: boolean;
  setRevealVotes: (reveal: boolean) => void;
  submitVote: (choiceId: string) => void;
  currentMirrorQuestion: string | null;
  scenarios: Scenario[];
}

interface GameProviderProps {
  children: React.ReactNode;
}

const GameContext = createContext<GameContextProps>({
  gameState: initialGameState,
  sceneHistory: [],
  makeChoice: () => {},
  resetGame: () => {},
  startScenario: () => {},
  isGameActive: false,
  mirrorMomentsEnabled: true,
  toggleMirrorMoments: () => {},
  showMirrorMoment: false,
  setShowMirrorMoment: () => {},
  userRole: 'student',
  gameMode: 'individual',
  setGameMode: () => {},
  classroomId: null,
  setClassroomId: () => {},
  classroomVotes: [],
  setClassroomVotes: () => {},
  revealVotes: false,
  setRevealVotes: () => {},
  submitVote: () => {},
  currentMirrorQuestion: null,
  scenarios: scenarios,
});

export const useGameContext = () => useContext(GameContext);

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [sceneHistory, setSceneHistory] = useState<SceneHistoryEntry[]>([]);
  const [mirrorMomentsEnabled, setMirrorMomentsEnabled] = useState(true);
  const [showMirrorMoment, setShowMirrorMoment] = useState(false);
  const [currentMirrorQuestion, setCurrentMirrorQuestion] = useState<string | null>(null);

  const { userProfile, currentUser, refreshUserProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const userRole = userProfile?.role || 'student';

  // Game mode state
  const [gameMode, setGameMode] = useState<'individual' | 'classroom'>('individual');
  const [classroomId, setClassroomId] = useState<string | null>(null);
  const [classroomVotes, setClassroomVotes] = useState<any[]>([]);
  const [revealVotes, setRevealVotes] = useState(false);

  useEffect(() => {
    if (classroomId) {
      console.log("Classroom ID set:", classroomId);
    }
  }, [classroomId]);

  useEffect(() => {
    if (gameMode === 'classroom') {
      console.log("Game mode set to classroom");
    } else {
      console.log("Game mode set to individual");
    }
  }, [gameMode]);

  useEffect(() => {
    // Set up votes listener if in classroom mode
    if (gameMode === 'classroom' && classroomId && gameState.currentScene) {
      const unsubscribe = onVotesUpdated(classroomId, (votes) => {
        setClassroomVotes(votes);
      });
      
      return () => {
        unsubscribe();
      };
    }
  }, [gameMode, classroomId, gameState.currentScene]);

  const resetGame = () => {
    setGameState(initialGameState);
    setSceneHistory([]);
    setRevealVotes(false);
  };
  
  // Initialize game with a scenario
  const startScenario = (scenarioId: string) => {
    // Find the scenario
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (!scenario) {
      console.error("Scenario not found:", scenarioId);
      return;
    }

    // Find the initial scene - look for a scene marked as start or just use the first scene
    const initialScene = scenario.scenes.find(s => s.id.includes('start') || s.id.includes('intro')) || scenario.scenes[0];
    if (!initialScene) {
      console.error("Initial scene not found for scenario:", scenarioId);
      return;
    }
    
    // Log scenario start
    console.log(`Starting scenario: ${scenario.title} (${scenarioId})`);

    // Set game state
    setGameState({
      ...initialGameState,
      currentScenario: scenario,
      currentScene: initialScene,
      isActive: true,
      startTime: new Date()
    });

    // Add first scene to history
    setSceneHistory([
      {
        sceneId: initialScene.id,
        timestamp: new Date(),
        metrics: { ...initialGameState.metrics }
      }
    ]);
  };

  // Submit vote in classroom mode
  const submitVote = async (choiceId: string) => {
    if (!classroomId || !currentUser || !gameState.currentScene) {
      console.error("Cannot submit vote: missing required data");
      return;
    }

    try {
      await recordStudentVote(classroomId, currentUser.uid, choiceId);
      toast({
        title: "Vote Submitted",
        description: "Your vote has been recorded.",
      });
    } catch (error) {
      console.error("Error submitting vote:", error);
      toast({
        title: "Error",
        description: "Failed to submit your vote.",
        variant: "destructive",
      });
    }
  };

  // Handle choice selection
  const makeChoice = (choiceId: string) => {
    if (!gameState.currentScene || !gameState.currentScenario) return;

    // Find the choice
    const choice = gameState.currentScene.choices.find(c => c.id === choiceId);
    if (!choice) return;
    
    console.log("Making choice:", choice);

    // Calculate metrics changes
    const newMetrics = { ...gameState.metrics };
    if (choice.metricChanges) {
      Object.entries(choice.metricChanges).forEach(([metric, value]) => {
        if (metric in newMetrics && typeof value === 'number') {
          newMetrics[metric as keyof Metrics] += value;
        }
      });
    }
    
    // Find the next scene
    const nextScene = gameState.currentScenario.scenes.find(
      scene => scene.id === choice.nextSceneId
    );

    if (!nextScene) {
      console.error("Next scene not found:", choice.nextSceneId);
      return;
    }

    // Update game state with new scene and updated metrics
    setGameState({
      ...gameState,
      currentScene: nextScene,
      metrics: newMetrics,
      choices: [...gameState.choices, {
        sceneId: gameState.currentScene.id,
        choiceId: choice.id,
        text: choice.text,
        timestamp: new Date(),
        metricChanges: choice.metricChanges
      }]
    });

    // Add to scene history
    const newHistoryEntry = {
      sceneId: nextScene.id,
      timestamp: new Date(),
      metrics: { ...newMetrics },
      choiceId: choice.id,
      choiceText: choice.text
    };

    setSceneHistory([...sceneHistory, newHistoryEntry]);
    
    // Special handling for mirror moments
    if (mirrorMomentsEnabled && (nextScene.id.includes('reflect') || Math.random() < 0.1)) {
      setCurrentMirrorQuestion("How do you feel about the choice you just made?");
      setShowMirrorMoment(true);
      setTimeout(() => setShowMirrorMoment(false), 8000);
    }
    
    // Special handling for classroom mode and ending scenes
    if (gameMode === 'classroom' && classroomId) {
      if (nextScene.isEnding) {
        // Save classroom scenario completion
        saveScenarioResult(nextScene.id, true);
      } else {
        // Record vote in classroom
        try {
          // This is handled separately through ClassroomVoting component
          console.log("Classroom choice made:", choice.id);
        } catch (error) {
          console.error("Failed to record classroom vote:", error);
        }
      }
    } else if (nextScene.isEnding) {
      // Regular scenario completion
      saveScenarioResult(nextScene.id);
    }
  };

  // Save scenario results
  const saveScenarioResult = async (finalSceneId: string, isClassroom = false) => {
    if (!gameState.currentScenario) return;

    // Calculate time taken
    const endTime = new Date();
    const timeTaken = endTime.getTime() - (gameState.startTime?.getTime() || 0);
    const timeInSeconds = Math.round(timeTaken / 1000);

    // Log the scenario completion
    console.log(`Scenario completed: ${gameState.currentScenario.title} in ${timeInSeconds} seconds`);

    // Map choices to the format expected by Firebase
    const choicesHistory = gameState.choices.map(choice => ({
      sceneId: choice.sceneId,
      choiceId: choice.choiceId,
      choiceText: choice.text,
      timestamp: new Date(choice.timestamp),
      metricChanges: choice.metricChanges
    }));

    try {
      if (currentUser) {
        // Save to Firebase with optional classroomId for classroom mode
        await saveScenarioHistory(
          currentUser.uid,
          gameState.currentScenario.id,
          gameState.currentScenario.title,
          choicesHistory,
          gameState.metrics,
          isClassroom ? classroomId! : undefined
        );

        // Refresh user profile to get updated stats
        if (refreshUserProfile) {
          await refreshUserProfile();
        }

        // Award any badges
        checkForBadges();
      }
    } catch (error) {
      console.error("Error saving scenario history:", error);
      toast({
        title: "Error",
        description: "Failed to save your progress.",
        variant: "destructive"
      });
    }
  };
  
  const checkForBadges = async () => {
    if (!currentUser || !userProfile) return;

    // Check for "First Scenario" badge
    if (!userProfile.badges?.some(badge => badge.id === 'first-scenario') && gameState.currentScenario) {
      const awarded = await awardBadge(currentUser.uid, 'first-scenario', 'First Scenario');
      if (awarded) {
        toast({
          title: "Badge Earned!",
          description: "You've earned the 'First Scenario' badge!",
        });
      }
    }

    // Check for "Perfect Score" badge (all metrics at 100)
    const perfectScore = Object.values(gameState.metrics).every(value => value === 100);
    if (perfectScore && !userProfile.badges?.some(badge => badge.id === 'perfect-score')) {
      const awarded = await awardBadge(currentUser.uid, 'perfect-score', 'Perfect Score');
      if (awarded) {
        toast({
          title: "Badge Earned!",
          description: "You've earned the 'Perfect Score' badge for achieving a perfect score!",
        });
      }
    }
  };

  const toggleMirrorMoments = () => {
    setMirrorMomentsEnabled(!mirrorMomentsEnabled);
    toast({
      title: "Mirror Moments",
      description: `Mirror moments are now ${!mirrorMomentsEnabled ? 'enabled' : 'disabled'}.`,
    });
  };

  return (
    <GameContext.Provider
      value={{
        gameState,
        sceneHistory,
        makeChoice,
        resetGame,
        startScenario,
        isGameActive: gameState.isActive,
        mirrorMomentsEnabled,
        toggleMirrorMoments,
        showMirrorMoment,
        setShowMirrorMoment,
        userRole,
        gameMode,
        setGameMode,
        classroomId,
        setClassroomId,
        classroomVotes,
        setClassroomVotes,
        revealVotes,
        setRevealVotes,
        submitVote,
        currentMirrorQuestion,
        scenarios
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
