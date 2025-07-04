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
  const [isScenarioHistoryLoading, setIsScenarioHistoryLoading] = useState<boolean>(true);
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

  // Load mock data for testing
  useEffect(() => {
    const loadMockData = () => {
      console.log("Loading mock scenario history data...");
      
      const mockHistory: LocalScenarioHistory[] = [
        {
          scenarioId: 'first-job',
          scenarioTitle: '🎯 Your First Job Adventure',
          startedAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
          completedAt: new Date(Date.now() - 86400000 * 2 + 3600000), // 2 days ago + 1 hour
          choices: [
            {
              sceneId: 'scene1',
              choiceId: 'choice1',
              choiceText: 'Accept the challenging project to learn new skills',
              timestamp: new Date(Date.now() - 86400000 * 2),
              metricChanges: { knowledge: 10, money: -5 }
            },
            {
              sceneId: 'scene2',
              choiceId: 'choice2',
              choiceText: 'Ask for help from a senior colleague',
              timestamp: new Date(Date.now() - 86400000 * 2 + 1800000),
              metricChanges: { relationships: 15, happiness: 5 }
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
          startedAt: new Date(Date.now() - 86400000), // 1 day ago
          completedAt: new Date(Date.now() - 86400000 + 2700000), // 1 day ago + 45 minutes
          choices: [
            {
              sceneId: 'scene1',
              choiceId: 'choice1',
              choiceText: 'Create a strict budget and stick to it',
              timestamp: new Date(Date.now() - 86400000),
              metricChanges: { money: 20, knowledge: 5 }
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
          scenarioTitle: '👥 Friendship Drama',
          startedAt: new Date(Date.now() - 43200000), // 12 hours ago
          completedAt: new Date(Date.now() - 43200000 + 1800000), // 12 hours ago + 30 minutes
          choices: [
            {
              sceneId: 'scene1',
              choiceId: 'choice1',
              choiceText: 'Have an honest conversation with your friend',
              timestamp: new Date(Date.now() - 43200000),
              metricChanges: { relationships: 25, happiness: 10 }
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

      console.log("Mock scenario history loaded:", mockHistory);
      setScenarioHistory(mockHistory);
      setIsScenarioHistoryLoading(false);
      
      // Also save to localStorage for persistence
      localStorage.setItem('scenarioHistory', JSON.stringify(mockHistory));
    };

    // Load from localStorage first, if empty load mock data
    const fetchScenarioHistory = async () => {
      try {
        setIsScenarioHistoryLoading(true);
        console.log("Fetching scenario history...");
        
        const storedHistory = localStorage.getItem('scenarioHistory');
        if (storedHistory && JSON.parse(storedHistory).length > 0) {
          const parsedHistory = JSON.parse(storedHistory);
          console.log("Loaded from localStorage:", parsedHistory);
          setScenarioHistory(parsedHistory);
        } else {
          console.log("No stored history found, loading mock data");
          loadMockData();
        }
      } catch (error) {
        console.error('Error fetching scenario history:', error);
        console.log("Error occurred, loading mock data as fallback");
        loadMockData();
      } finally {
        setIsScenarioHistoryLoading(false);
      }
    };

    fetchScenarioHistory();
  }, []);

  const saveScenarioHistory = async (scenarioData: LocalScenarioHistory) => {
    try {
      console.log("Saving scenario history:", scenarioData);
      
      const newHistory = [...scenarioHistory, scenarioData];
      setScenarioHistory(newHistory);
      localStorage.setItem('scenarioHistory', JSON.stringify(newHistory));
      
      toast({
        title: "Progress Saved!",
        description: "Your scenario progress has been saved.",
      });
    } catch (error) {
      console.error('Error saving scenario history:', error);
      toast({
        title: "Save Error",
        description: "Could not save your progress. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchScenarioHistoryCallback = useCallback(async () => {
    try {
      setIsScenarioHistoryLoading(true);
      const storedHistory = localStorage.getItem('scenarioHistory');
      if (storedHistory) {
        const parsedHistory = JSON.parse(storedHistory);
        console.log("Refreshed scenario history:", parsedHistory);
        setScenarioHistory(parsedHistory);
      }
    } catch (error) {
      console.error('Error fetching scenario history:', error);
    } finally {
      setIsScenarioHistoryLoading(false);
    }
  }, []);

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
    
    // Game modes and settings
    gameMode,
    setGameMode,
    userRole,
    setUserRole: () => {}, // This would be handled by AuthContext
    
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
