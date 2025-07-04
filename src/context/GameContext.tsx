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
  ScenarioHistory as ScenarioHistoryType,
} from '@/types/game';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from './AuthContext';
import {
  getScenarios,
  getScenarioHistory as getScenarioHistoryFromDB,
  addScenarioHistory as addScenarioHistoryToDB,
} from '@/lib/firebase';

interface Metrics {
  happiness: number;
  knowledge: number;
  money: number;
  relationship: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
}

export interface ScenarioHistory {
  scenarioId: string;
  scenarioTitle: string;
  startedAt: Date;
  completedAt: Date;
  choices: any[];
  finalMetrics: Record<string, number>;
}

interface GameContextType {
  currentScenario: Scenario | null;
  currentScene: Scene | null;
  sceneHistory: any[];
  metrics: Metrics;
  achievements: Achievement[];
  isGameActive: boolean;
  isTeacherViewOpen: boolean;
  classroomVotingData: any | null;
  gameMode: 'individual' | 'classroom';
  userRole: string | null | undefined;
  scenarioHistory: ScenarioHistory[];
  isScenarioHistoryLoading: boolean;
  startNewScenario: (scenarioId: string) => Promise<void>;
  makeChoice: (choice: any) => void;
  completeScenario: (finalMetrics: Record<string, number>) => Promise<void>;
  resetGame: () => void;
  setGameMode: (mode: 'individual' | 'classroom') => void;
  setIsTeacherViewOpen: (isOpen: boolean) => void;
  setClassroomVotingData: (data: any | null) => void;
  fetchScenarioHistory: () => Promise<void>;
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
    relationship: 50,
  });
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isGameActive, setIsGameActive] = useState<boolean>(false);
  const [isTeacherViewOpen, setIsTeacherViewOpen] = useState<boolean>(false);
  const [classroomVotingData, setClassroomVotingData] = useState<any | null>(null);
  const [gameMode, setGameMode] = useState<'individual' | 'classroom'>('individual');
  const [scenarioHistory, setScenarioHistory] = useState<ScenarioHistory[]>([]);
  const [isScenarioHistoryLoading, setIsScenarioHistoryLoading] = useState<boolean>(true);
  const { currentUser, userProfile } = useAuth();
  const { toast } = useToast();

  const userRole = userProfile?.role;

  const saveScenarioHistory = async (scenarioData: ScenarioHistory) => {
    try {
      if (!currentUser) {
        console.log("No authenticated user, saving to local storage only");
        setScenarioHistory(prev => [...prev, scenarioData]);
        const existingHistory = localStorage.getItem('scenarioHistory');
        const history = existingHistory ? JSON.parse(existingHistory) : [];
        history.push(scenarioData);
        localStorage.setItem('scenarioHistory', JSON.stringify(history));
        return;
      }

      const historyData = {
        scenarioId: scenarioData.scenarioId,
        scenarioTitle: scenarioData.scenarioTitle,
        startedAt: scenarioData.startedAt,
        completedAt: scenarioData.completedAt,
        choices: scenarioData.choices,
        finalMetrics: scenarioData.finalMetrics,
      };

      await addScenarioHistoryToDB(currentUser.uid, historyData);
      setScenarioHistory(prev => [...prev, scenarioData]);
      
      toast({
        title: "Progress Saved!",
        description: "Your scenario progress has been saved to your profile.",
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

  const fetchScenarioHistory = useCallback(async () => {
    if (!currentUser) {
      console.log("Not authenticated, loading scenario history from local storage");
      const storedHistory = localStorage.getItem('scenarioHistory');
      if (storedHistory) {
        setScenarioHistory(JSON.parse(storedHistory));
      } else {
        setScenarioHistory([]);
      }
      setIsScenarioHistoryLoading(false);
      return;
    }

    try {
      setIsScenarioHistoryLoading(true);
      const history = await getScenarioHistoryFromDB(currentUser.uid) || [];
      setScenarioHistory(history);
    } catch (error) {
      console.error('Error fetching scenario history:', error);
      toast({
        title: "Load Error",
        description: "Could not load your scenario history. Please try again.",
        variant: "destructive",
      });
      setScenarioHistory([]);
    } finally {
      setIsScenarioHistoryLoading(false);
    }
  }, [currentUser, toast]);

  useEffect(() => {
    fetchScenarioHistory();
  }, [fetchScenarioHistory]);

  const startNewScenario = async (scenarioId: string) => {
    try {
      const scenarios = await getScenarios();
      const scenario = scenarios.find((s) => s.id === scenarioId);

      if (!scenario) {
        console.error(`Scenario with id ${scenarioId} not found`);
        toast({
          title: "Scenario Not Found",
          description: "Failed to start the scenario. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setCurrentScenario(scenario);
      setCurrentScene(scenario.scenes[0]);
      setSceneHistory([]);
      setIsGameActive(true);
      setMetrics({ happiness: 50, knowledge: 50, money: 50, relationship: 50 });
    } catch (error) {
      console.error('Error starting scenario:', error);
      toast({
        title: "Start Error",
        description: "Failed to start the scenario. Please try again.",
        variant: "destructive",
      });
    }
  };

  const makeChoice = (choice: any) => {
    if (!currentScenario || !currentScene) return;

    setSceneHistory([...sceneHistory, choice]);

    // Update metrics based on the choice
    setMetrics((prevMetrics) => {
      let newMetrics = { ...prevMetrics };
      if (choice.metricChanges) {
        Object.keys(choice.metricChanges).forEach((metric) => {
          if (newMetrics.hasOwnProperty(metric)) {
            newMetrics = {
              ...newMetrics,
              [metric]: Math.max(
                0,
                Math.min(100, prevMetrics[metric] + choice.metricChanges[metric])
              ),
            };
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
      toast({
        title: "Scene Not Found",
        description: "Failed to load the next scene. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setCurrentScene(nextScene);
  };

  const resetGame = () => {
    setIsGameActive(false);
    setCurrentScenario(null);
    setCurrentScene(null);
    setSceneHistory([]);
    setMetrics({ happiness: 50, knowledge: 50, money: 50, relationship: 50 });
    setAchievements([]);
    if (gameMode === 'classroom') {
      setIsTeacherViewOpen(false);
      setClassroomVotingData(null);
    }
  };

  const completeScenario = async (finalMetrics: Record<string, number>) => {
    if (!currentScenario) return;

    const scenarioData: ScenarioHistory = {
      scenarioId: currentScenario.id,
      scenarioTitle: currentScenario.title,
      startedAt: new Date(),
      completedAt: new Date(),
      choices: sceneHistory,
      finalMetrics: finalMetrics,
    };

    await saveScenarioHistory(scenarioData);
    
    // Update achievements
    const newAchievements = [...achievements];
    
    // Add achievement logic here if needed
    
    setAchievements(newAchievements);
    resetGame();
  };

  const value: GameContextType = {
    currentScenario,
    currentScene,
    sceneHistory,
    metrics,
    achievements,
    isGameActive,
    isTeacherViewOpen,
    classroomVotingData,
    gameMode,
    userRole,
    scenarioHistory,
    isScenarioHistoryLoading,
    startNewScenario,
    makeChoice,
    completeScenario,
    resetGame,
    setGameMode,
    setIsTeacherViewOpen,
    setClassroomVotingData,
    fetchScenarioHistory,
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
