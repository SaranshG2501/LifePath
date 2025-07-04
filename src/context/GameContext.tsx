
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
  ScenarioHistory,
  Metrics,
} from '@/types/game';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from './AuthContext';
import { scenarios } from '@/data/scenarios';

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
  scenarioHistory: ScenarioHistory[];
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
  const [scenarioHistory, setScenarioHistory] = useState<ScenarioHistory[]>([]);
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

      // For now, just save to local state and localStorage
      setScenarioHistory(prev => [...prev, scenarioData]);
      const existingHistory = localStorage.getItem('scenarioHistory');
      const history = existingHistory ? JSON.parse(existingHistory) : [];
      history.push(scenarioData);
      localStorage.setItem('scenarioHistory', JSON.stringify(history));
      
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

  const fetchScenarioHistory = useCallback(async () => {
    try {
      setIsScenarioHistoryLoading(true);
      const storedHistory = localStorage.getItem('scenarioHistory');
      if (storedHistory) {
        setScenarioHistory(JSON.parse(storedHistory));
      } else {
        setScenarioHistory([]);
      }
    } catch (error) {
      console.error('Error fetching scenario history:', error);
      setScenarioHistory([]);
    } finally {
      setIsScenarioHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScenarioHistory();
  }, [fetchScenarioHistory]);

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

    const scenarioData: ScenarioHistory = {
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
    fetchScenarioHistory,
    
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
