
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, saveScenarioHistory } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export interface ScenarioChoice {
  sceneId: string;
  choiceId: string;
  choiceText: string;
  timestamp: any;
  metricChanges?: Record<string, number>;
}

export interface ScenarioHistory {
  scenarioId: string;
  scenarioTitle: string;
  completedAt: any;
  startedAt: any;
  choices: ScenarioChoice[];
  finalMetrics: Record<string, number>;
}

interface GameContextType {
  currentScenario: any;
  setCurrentScenario: (scenario: any) => void;
  currentScenarioId: string | null;
  setCurrentScenarioId: (id: string | null) => void;
  currentScene: any;
  setCurrentScene: (scene: any) => void;
  gameMetrics: Record<string, number>;
  setGameMetrics: (metrics: Record<string, number>) => void;
  scenarioHistory: ScenarioHistory[];
  setScenarioHistory: (history: ScenarioHistory[]) => void;
  gameMode: 'solo' | 'classroom';
  setGameMode: (mode: 'solo' | 'classroom') => void;
  currentClassroomId: string | null;
  setCurrentClassroomId: (id: string | null) => void;
  teacherName: string | null;
  setTeacherName: (name: string | null) => void;
  isStudent: boolean;
  setIsStudent: (isStudent: boolean) => void;
  fetchScenarioHistory: () => Promise<void>;
  addScenarioToHistory: (scenario: ScenarioHistory) => Promise<void>;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScenario, setCurrentScenario] = useState(null);
  const [currentScenarioId, setCurrentScenarioId] = useState<string | null>(null);
  const [currentScene, setCurrentScene] = useState(null);
  const [gameMetrics, setGameMetrics] = useState<Record<string, number>>({
    happiness: 70,
    knowledge: 60,
    money: 50,
    relationships: 65,
    health: 75,
  });
  const [scenarioHistory, setScenarioHistory] = useState<ScenarioHistory[]>([]);
  const [gameMode, setGameMode] = useState<'solo' | 'classroom'>('solo');
  const [currentClassroomId, setCurrentClassroomId] = useState<string | null>(null);
  const [teacherName, setTeacherName] = useState<string | null>(null);
  const [isStudent, setIsStudent] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        fetchScenarioHistory();
      } else {
        setScenarioHistory([]);
      }
    });

    return unsubscribe;
  }, []);

  const fetchScenarioHistory = async () => {
    if (!auth.currentUser) {
      console.log('No authenticated user, skipping history fetch');
      return;
    }

    try {
      console.log('Fetching scenario history for user:', auth.currentUser.uid);
      
      // Query the scenarioHistory collection for this user
      const historyQuery = query(
        collection(db, 'scenarioHistory'),
        where('userId', '==', auth.currentUser.uid),
        orderBy('completedAt', 'desc')
      );

      const historySnapshot = await getDocs(historyQuery);
      const historyData: ScenarioHistory[] = [];

      historySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('Raw history document:', data);
        
        const historyItem: ScenarioHistory = {
          scenarioId: data.scenarioId || '',
          scenarioTitle: data.scenarioTitle || data.title || 'Unknown Scenario',
          completedAt: data.completedAt,
          startedAt: data.startedAt || data.completedAt,
          choices: data.choices || [],
          finalMetrics: data.finalMetrics || {}
        };
        
        historyData.push(historyItem);
      });

      console.log('Processed scenario history:', historyData);
      setScenarioHistory(historyData);
    } catch (error) {
      console.error('Error fetching scenario history:', error);
    }
  };

  const addScenarioToHistory = async (scenario: ScenarioHistory) => {
    if (!auth.currentUser) {
      console.log('No authenticated user, cannot save scenario history');
      return;
    }

    try {
      console.log('Adding scenario to history:', scenario);
      
      // Ensure all required fields are present
      const completeScenario: ScenarioHistory = {
        scenarioId: scenario.scenarioId,
        scenarioTitle: scenario.scenarioTitle,
        completedAt: scenario.completedAt,
        startedAt: scenario.startedAt || scenario.completedAt,
        choices: scenario.choices || [],
        finalMetrics: scenario.finalMetrics || {}
      };

      // Save to Firestore
      await saveScenarioHistory(auth.currentUser.uid, completeScenario);
      
      // Update local state
      setScenarioHistory(prev => [completeScenario, ...prev]);
      
      console.log('Scenario history saved successfully');
    } catch (error) {
      console.error('Error saving scenario history:', error);
    }
  };

  const resetGame = () => {
    setCurrentScenario(null);
    setCurrentScenarioId(null);
    setCurrentScene(null);
    setGameMetrics({
      happiness: 70,
      knowledge: 60,
      money: 50,
      relationships: 65,
      health: 75,
    });
  };

  const value: GameContextType = {
    currentScenario,
    setCurrentScenario,
    currentScenarioId,
    setCurrentScenarioId,
    currentScene,
    setCurrentScene,
    gameMetrics,
    setGameMetrics,
    scenarioHistory,
    setScenarioHistory,
    gameMode,
    setGameMode,
    currentClassroomId,
    setCurrentClassroomId,
    teacherName,
    setTeacherName,
    isStudent,
    setIsStudent,
    fetchScenarioHistory,
    addScenarioToHistory,
    resetGame,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};
