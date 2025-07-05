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

// Local interface for scenario history to avoid conflicts
interface LocalScenarioHistory {
  scenarioId: string;
  scenarioTitle: string;
  startedAt: Date;
  completedAt: Date;
  choices: any[];
  finalMetrics: Record<string, number>;
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
  scenarioHistory: LocalScenarioHistory[];
  isScenarioHistoryLoading: boolean;
  
  // Game controls
  startScenario: (id: string) => Promise<void>;
  startNewScenario: (scenarioId: string) => Promise<void>;
  makeChoice: (choiceId: string) => void;
  resetGame: () => void;
  completeScenario: (finalMetrics: Record<string, number>) => Promise<void>;
  fetchScenarioHistory: () => Promise<void>;
  refreshScenarioHistory: () => Promise<void>;
  
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
  const [scenarioHistory, setScenarioHistory] = useState<LocalScenarioHistory[]>([]);
  const [isScenarioHistoryLoading, setIsScenarioHistoryLoading] = useState<boolean>(false);
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

  // Enhanced mock data generation with immediate loading
  const generateMockHistory = useCallback(() => {
    console.log("🎮 Generating fresh mock scenario history...");
    
    const mockHistory: LocalScenarioHistory[] = [
      {
        scenarioId: 'first-job',
        scenarioTitle: '🎯 Your First Job Adventure',
        startedAt: new Date(Date.now() - 86400000 * 2),
        completedAt: new Date(Date.now() - 86400000 * 2 + 3600000),
        choices: [
          {
            sceneId: 'scene1',
            choiceId: 'choice1',
            choiceText: 'Accept the challenging project to learn new skills and prove your worth',
            timestamp: new Date(Date.now() - 86400000 * 2),
            metricChanges: { knowledge: 15, money: -5, health: -5 }
          },
          {
            sceneId: 'scene2',
            choiceId: 'choice2',
            choiceText: 'Ask for help from a senior colleague and build relationships',
            timestamp: new Date(Date.now() - 86400000 * 2 + 1800000),
            metricChanges: { relationships: 20, happiness: 10, knowledge: 5 }
          }
        ],
        finalMetrics: {
          health: 75,
          money: 65,
          happiness: 80,
          knowledge: 85,
          relationships: 70
        }
      },
      {
        scenarioId: 'college-debt',
        scenarioTitle: '🎓 College Debt Dilemma',
        startedAt: new Date(Date.now() - 86400000),
        completedAt: new Date(Date.now() - 86400000 + 2700000),
        choices: [
          {
            sceneId: 'scene1',
            choiceId: 'choice1',
            choiceText: 'Create a strict budget and stick to it religiously',
            timestamp: new Date(Date.now() - 86400000),
            metricChanges: { money: 25, knowledge: 10, happiness: -5 }
          }
        ],
        finalMetrics: {
          health: 60,
          money: 90,
          happiness: 65,
          knowledge: 75,
          relationships: 55
        }
      },
      {
        scenarioId: 'friendship-drama',
        scenarioTitle: '👥 Friendship Drama Crisis',
        startedAt: new Date(Date.now() - 43200000),
        completedAt: new Date(Date.now() - 43200000 + 1800000),
        choices: [
          {
            sceneId: 'scene1',
            choiceId: 'choice1',
            choiceText: 'Have an honest conversation with your friend',
            timestamp: new Date(Date.now() - 43200000),
            metricChanges: { relationships: 30, happiness: 15 }
          }
        ],
        finalMetrics: {
          health: 70,
          money: 50,
          happiness: 85,
          knowledge: 60,
          relationships: 95
        }
      }
    ];

    console.log("✅ Mock history generated:", mockHistory.length, "scenarios");
    return mockHistory;
  }, []);

  // Initialize history immediately
  useEffect(() => {
    console.log("🚀 Initializing scenario history...");
    setIsScenarioHistoryLoading(true);
    
    const history = generateMockHistory();
    setScenarioHistory(history);
    localStorage.setItem('scenarioHistory', JSON.stringify(history));
    
    setTimeout(() => {
      setIsScenarioHistoryLoading(false);
      console.log("✅ History loading complete!");
    }, 500);
  }, [generateMockHistory]);

  const fetchScenarioHistoryCallback = useCallback(async () => {
    console.log("🔄 Refreshing scenario history...");
    setIsScenarioHistoryLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate loading
      const newHistory = generateMockHistory();
      setScenarioHistory(newHistory);
      localStorage.setItem('scenarioHistory', JSON.stringify(newHistory));
      
      toast({
        title: "🎉 History Refreshed!",
        description: "Your epic adventures have been updated.",
      });
    } catch (error) {
      console.error('Error refreshing history:', error);
    } finally {
      setIsScenarioHistoryLoading(false);
    }
  }, [generateMockHistory, toast]);

  const refreshScenarioHistory = fetchScenarioHistoryCallback;

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
      // End of scenario
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
    if (!currentScenario) return;

    const scenarioData: LocalScenarioHistory = {
      scenarioId: currentScenario.id,
      scenarioTitle: currentScenario.title,
      startedAt: new Date(),
      completedAt: new Date(),
      choices: sceneHistory,
      finalMetrics: finalMetrics,
    };

    await saveScenarioHistory(scenarioData);
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
    isScenarioHistoryLoading,
    
    // Game controls
    startScenario,
    startNewScenario,
    makeChoice,
    resetGame,
    completeScenario,
    fetchScenarioHistory: fetchScenarioHistoryCallback,
    refreshScenarioHistory,
    
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
