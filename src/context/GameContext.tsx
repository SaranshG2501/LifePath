
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import {
  Scenario,
  Scene,
  GameState,
  GameMode,
  UserRole,
  Achievement,
  Metrics,
} from '@/types/game';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from './AuthContext';
import { scenarios } from '@/data/scenarios';

// Simple scenario history interface
interface ScenarioHistoryItem {
  id: string;
  scenarioId: string;
  title: string;
  completedAt: string;
  score: number;
  choices: number;
  metrics: {
    health: number;
    money: number;
    happiness: number;
    knowledge: number;
    relationships: number;
  };
}

interface GameContextType {
  // Game state
  gameState: GameState;
  currentScenario: Scenario | null;
  currentScene: Scene | null;
  sceneHistory: any[];
  metrics: Metrics;
  achievements: Achievement[];
  isGameActive: boolean;
  
  // Scenarios
  scenarios: Scenario[];
  scenarioHistory: ScenarioHistoryItem[];
  isHistoryLoading: boolean;
  
  // Game controls
  startScenario: (id: string) => Promise<void>;
  startNewScenario: (scenarioId: string) => Promise<void>;
  makeChoice: (choiceId: string) => void;
  resetGame: () => void;
  completeScenario: (finalMetrics: Record<string, number>) => Promise<void>;
  refreshHistory: () => void;
  
  // Game modes and settings
  gameMode: GameMode;
  setGameMode: (mode: GameMode) => void;
  userRole: UserRole | null | undefined;
  setUserRole: (role: UserRole) => void;
  
  // Classroom functionality
  classroomId: string | null;
  setClassroomId: (id: string | null) => void;
  hasJoinedClassroom: boolean;
  isModeLocked: boolean;
  
  // Voting system
  classroomVotes: Record<string, number>;
  submitVote: (choiceId: string) => void;
  revealVotes: boolean;
  setRevealVotes: (reveal: boolean) => void;
  
  // Mirror moments
  showMirrorMoment: boolean;
  setShowMirrorMoment: (show: boolean) => void;
  currentMirrorQuestion: string | null;
  setCurrentMirrorQuestion: (question: string | null) => void;
  mirrorMomentsEnabled: boolean;
  toggleMirrorMoments: () => void;
  
  // Teacher view
  isTeacherViewOpen: boolean;
  setIsTeacherViewOpen: (isOpen: boolean) => void;
  classroomVotingData: any | null;
  setClassroomVotingData: (data: any | null) => void;
  
  // Scene navigation
  setCurrentScene: (sceneId: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [currentScene, setCurrentScene] = useState<Scene | null>(null);
  const [sceneHistory, setSceneHistory] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    happiness: 50,
    knowledge: 50,
    money: 50,
    health: 50,
    relationships: 50,
  });
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isGameActive, setIsGameActive] = useState<boolean>(false);
  const [isTeacherViewOpen, setIsTeacherViewOpen] = useState<boolean>(false);
  const [classroomVotingData, setClassroomVotingData] = useState<any | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>('individual');
  const [scenarioHistory, setScenarioHistory] = useState<ScenarioHistoryItem[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(true);
  const [classroomId, setClassroomId] = useState<string | null>(null);
  const [classroomVotes, setClassroomVotes] = useState<Record<string, number>>({});
  const [revealVotes, setRevealVotes] = useState<boolean>(false);
  const [showMirrorMoment, setShowMirrorMoment] = useState<boolean>(false);
  const [currentMirrorQuestion, setCurrentMirrorQuestion] = useState<string | null>(null);
  const [mirrorMomentsEnabled, setMirrorMomentsEnabled] = useState<boolean>(true);
  
  const { currentUser, userProfile } = useAuth();
  const { toast } = useToast();

  const userRole = userProfile?.role;
  const hasJoinedClassroom = Boolean(classroomId);
  const isModeLocked = false;

  const gameState: GameState = {
    currentScenario,
    currentScene,
    metrics,
    history: sceneHistory,
  };

  // Get storage key for current user
  const getStorageKey = useCallback(() => {
    if (currentUser?.uid) {
      return `lifepath_history_${currentUser.uid}`;
    }
    return 'lifepath_history_guest';
  }, [currentUser]);

  // Load history from localStorage
  const loadHistoryFromStorage = useCallback(() => {
    console.log('Loading history from storage...');
    setIsHistoryLoading(true);
    
    try {
      const storageKey = getStorageKey();
      const savedHistory = localStorage.getItem(storageKey);
      
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        console.log('Found saved history:', parsedHistory);
        
        // Validate and clean up the history data
        const validHistory = parsedHistory.filter((item: any) => 
          item.id && item.scenarioId && item.title && item.completedAt
        );
        
        setScenarioHistory(validHistory);
      } else {
        console.log('No saved history found');
        setScenarioHistory([]);
      }
    } catch (error) {
      console.error('Error loading history:', error);
      setScenarioHistory([]);
    } finally {
      setIsHistoryLoading(false);
    }
  }, [getStorageKey]);

  // Save history to localStorage
  const saveHistoryToStorage = useCallback((newHistory: ScenarioHistoryItem[]) => {
    try {
      const storageKey = getStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(newHistory));
      console.log('History saved to storage:', newHistory.length, 'items');
    } catch (error) {
      console.error('Error saving history:', error);
    }
  }, [getStorageKey]);

  // Load history when component mounts or user changes
  useEffect(() => {
    loadHistoryFromStorage();
  }, [loadHistoryFromStorage]);

  // Refresh history function
  const refreshHistory = useCallback(() => {
    console.log('Refreshing history...');
    loadHistoryFromStorage();
    
    toast({
      title: "History Refreshed!",
      description: "Your adventure history has been updated.",
    });
  }, [loadHistoryFromStorage, toast]);

  const startScenario = async (scenarioId: string) => {
    const scenario = scenarios.find((s) => s.id === scenarioId);
    if (!scenario) {
      console.error(`Scenario with id ${scenarioId} not found`);
      return;
    }

    setCurrentScenario(scenario);
    setCurrentScene(scenario.scenes[0]);
    setSceneHistory([]);
    setIsGameActive(true);
    setMetrics(scenario.initialMetrics);
  };

  const startNewScenario = async (scenarioId: string) => {
    await startScenario(scenarioId);
  };

  const makeChoice = (choiceId: string) => {
    if (!currentScenario || !currentScene) return;

    const choice = currentScene.choices.find(c => c.id === choiceId);
    if (!choice) return;

    setSceneHistory([...sceneHistory, choice]);

    // Update metrics based on the choice
    setMetrics((prevMetrics) => {
      const newMetrics = { ...prevMetrics };
      if (choice.metricChanges) {
        Object.keys(choice.metricChanges).forEach((metric) => {
          if (metric in newMetrics) {
            newMetrics[metric as keyof Metrics] = Math.max(
              0,
              Math.min(100, prevMetrics[metric as keyof Metrics] + (choice.metricChanges[metric as keyof Metrics] || 0))
            );
          }
        });
      }
      return newMetrics;
    });

    if (choice.nextSceneId === 'end') {
      return;
    }

    const nextScene = currentScenario.scenes.find(
      (scene) => scene.id === choice.nextSceneId
    );

    if (!nextScene) {
      console.error(`Next scene with id ${choice.nextSceneId} not found`);
      return;
    }

    setCurrentScene(nextScene);
  };

  const resetGame = () => {
    setIsGameActive(false);
    setCurrentScenario(null);
    setCurrentScene(null);
    setSceneHistory([]);
    setMetrics({ happiness: 50, knowledge: 50, money: 50, health: 50, relationships: 50 });
    setAchievements([]);
    if (gameMode === 'classroom') {
      setIsTeacherViewOpen(false);
      setClassroomVotingData(null);
    }
  };

  const completeScenario = async (finalMetrics: Record<string, number>) => {
    if (!currentScenario) {
      console.log('No current scenario to complete');
      return;
    }

    const newHistoryItem: ScenarioHistoryItem = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      scenarioId: currentScenario.id,
      title: currentScenario.title,
      completedAt: new Date().toISOString(),
      score: Object.values(finalMetrics).reduce((a, b) => a + b, 0),
      choices: sceneHistory.length,
      metrics: {
        health: finalMetrics.health || 0,
        money: finalMetrics.money || 0,
        happiness: finalMetrics.happiness || 0,
        knowledge: finalMetrics.knowledge || 0,
        relationships: finalMetrics.relationships || 0,
      }
    };

    console.log('Completing scenario, adding to history:', newHistoryItem);

    // Add to history and save
    const updatedHistory = [newHistoryItem, ...scenarioHistory];
    setScenarioHistory(updatedHistory);
    saveHistoryToStorage(updatedHistory);
    
    toast({
      title: "Scenario Complete!",
      description: "Your progress has been saved to your history.",
    });
    
    resetGame();
  };

  const submitVote = (choiceId: string) => {
    setClassroomVotes(prev => ({
      ...prev,
      [choiceId]: (prev[choiceId] || 0) + 1
    }));
  };

  const toggleMirrorMoments = () => {
    setMirrorMomentsEnabled(!mirrorMomentsEnabled);
  };

  const setCurrentSceneById = (sceneId: string) => {
    if (!currentScenario) return;
    const scene = currentScenario.scenes.find(s => s.id === sceneId);
    if (scene) {
      setCurrentScene(scene);
    }
  };

  const value: GameContextType = {
    // Game state
    gameState,
    currentScenario,
    currentScene,
    sceneHistory,
    metrics,
    achievements,
    isGameActive,
    
    // Scenarios
    scenarios,
    scenarioHistory,
    isHistoryLoading,
    
    // Game controls
    startScenario,
    startNewScenario,
    makeChoice,
    resetGame,
    completeScenario,
    refreshHistory,
    
    // Game modes and settings
    gameMode,
    setGameMode,
    userRole,
    setUserRole: () => {},
    
    // Classroom functionality
    classroomId,
    setClassroomId,
    hasJoinedClassroom,
    isModeLocked,
    
    // Voting system
    classroomVotes,
    submitVote,
    revealVotes,
    setRevealVotes,
    
    // Mirror moments
    showMirrorMoment,
    setShowMirrorMoment,
    currentMirrorQuestion,
    setCurrentMirrorQuestion,
    mirrorMomentsEnabled,
    toggleMirrorMoments,
    
    // Teacher view
    isTeacherViewOpen,
    setIsTeacherViewOpen,
    classroomVotingData,
    setClassroomVotingData,
    
    // Scene navigation
    setCurrentScene: setCurrentSceneById,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGameContext = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};
