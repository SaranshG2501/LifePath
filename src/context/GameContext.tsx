
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { scenarios } from '../data/scenarios';
import { 
  UserProfile, 
  ScenarioChoice, 
  saveScenarioHistory, 
  updateUserProfile,
  getUserClassrooms,
  getActiveSession,
  onLiveSessionUpdated,
  joinLiveSession,
  submitStudentVote,
  LiveSession
} from '../lib/firebase';
import { useAuth } from './AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Scenario, Scene, Choice, UserRole } from '../types/game';

interface Impact {
  environmental: number;
  social: number;
  economic: number;
}

interface GameState {
  currentScenario: Scenario | null;
  currentScene: Scene | null;
  sceneIndex: number;
  choices: ScenarioChoice[];
  userMetrics: Impact;
  gameMode: 'individual' | 'classroom';
  isEnded: boolean;
  currentClassroom?: any;
  currentSession?: LiveSession | null;
  isConnectedToSession: boolean;
}

interface GameContextType {
  gameState: GameState;
  startScenario: (scenarioId: string) => void;
  makeChoice: (choiceId: string) => void;
  resetGame: () => void;
  switchMode: (mode: 'individual' | 'classroom') => void;
  joinClassroomSession: (sessionId: string) => Promise<void>;
  submitVote: (choiceId: string) => Promise<void>;
  endGame: () => void;
  setCurrentClassroom: (classroom: any) => void;
  scenarios: Scenario[];
}

const initialGameState: GameState = {
  currentScenario: null,
  currentScene: null,
  sceneIndex: 0,
  choices: [],
  userMetrics: { environmental: 0, social: 0, economic: 0 },
  gameMode: 'individual',
  isEnded: false,
  currentClassroom: null,
  currentSession: null,
  isConnectedToSession: false
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const { currentUser, userProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (gameState.gameMode === 'classroom' && gameState.currentClassroom && !gameState.currentSession) {
      const fetchActiveSession = async () => {
        const session = await getActiveSession(gameState.currentClassroom.id);
        if (session) {
          setGameState(prev => ({ ...prev, currentSession: session }));
        }
      };
      fetchActiveSession();
    }
  }, [gameState.gameMode, gameState.currentClassroom]);

  useEffect(() => {
    if (gameState.currentSession) {
      const unsubscribe = onLiveSessionUpdated(gameState.currentSession.id!, (updatedSession) => {
        setGameState(prev => ({ ...prev, currentSession: updatedSession }));
      });

      return () => unsubscribe();
    }
  }, [gameState.currentSession]);

  const startScenario = (scenarioId: string) => {
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (!scenario) {
      console.error('Scenario not found');
      return;
    }

    setGameState(prev => ({
      ...prev,
      currentScenario: scenario,
      currentScene: scenario.scenes[0],
      sceneIndex: 0,
      choices: [],
      userMetrics: { environmental: 0, social: 0, economic: 0 },
      isEnded: false
    }));
  };

  const makeChoice = async (choiceId: string) => {
    if (!gameState.currentScene || !gameState.currentScenario) return;

    const choice = gameState.currentScene.choices.find(c => c.id === choiceId);
    if (!choice) return;

    // For classroom mode, submit vote instead of making choice directly
    if (gameState.gameMode === 'classroom' && gameState.currentSession) {
      await submitVote(choiceId);
      return;
    }

    // Individual mode logic
    const newChoice: ScenarioChoice = {
      sceneId: gameState.currentScene.id || '',
      choiceId: choice.id,
      choiceText: choice.text,
      timestamp: new Date() as any
    };

    const newMetrics = {
      environmental: gameState.userMetrics.environmental + (choice as any).impact.environmental,
      social: gameState.userMetrics.social + (choice as any).impact.social,
      economic: gameState.userMetrics.economic + (choice as any).impact.economic
    };

    const newChoices = [...gameState.choices, newChoice];

    if (choice.nextSceneId && !choice.nextSceneId.startsWith('ending')) {
      const nextScene = gameState.currentScenario.scenes.find(s => s.id === choice.nextSceneId);
      if (nextScene) {
        setGameState(prev => ({
          ...prev,
          currentScene: nextScene,
          sceneIndex: prev.sceneIndex + 1,
          choices: newChoices,
          userMetrics: newMetrics
        }));
      }
    } else {
      await endGameWithResults(newChoices, newMetrics);
    }
  };

  const endGameWithResults = async (finalChoices: ScenarioChoice[], finalMetrics: Impact) => {
    setGameState(prev => ({
      ...prev,
      isEnded: true,
      choices: finalChoices,
      userMetrics: finalMetrics
    }));

    if (currentUser && gameState.currentScenario) {
      try {
        await saveScenarioHistory(
          currentUser.uid,
          gameState.currentScenario.id,
          gameState.currentScenario.title,
          finalChoices,
          finalMetrics
        );

        if (userProfile) {
          const updatedProfile: Partial<UserProfile> = {
            xp: (userProfile.xp || 0) + 100,
            level: Math.floor(((userProfile.xp || 0) + 100) / 500) + 1
          };
          await updateUserProfile(currentUser.uid, updatedProfile);
        }
      } catch (error) {
        console.error('Error saving game results:', error);
      }
    }
  };

  const joinClassroomSession = async (sessionId: string) => {
    if (!currentUser || !userProfile) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to join classroom sessions',
        variant: 'destructive'
      });
      return;
    }

    if (userProfile.role === 'guest') {
      toast({
        title: 'Account required',
        description: 'Please sign in to join classroom sessions',
        variant: 'destructive'
      });
      return;
    }

    try {
      const session = await joinLiveSession(sessionId, currentUser.uid, userProfile.displayName || '');
      
      setGameState(prev => ({
        ...prev,
        currentSession: session,
        isConnectedToSession: true,
        gameMode: 'classroom'
      }));

      toast({
        title: 'Joined session',
        description: 'You have successfully joined the classroom session',
      });
    } catch (error: any) {
      console.error('Error joining session:', error);
      toast({
        title: 'Failed to join session',
        description: error.message || 'Please try again',
        variant: 'destructive'
      });
    }
  };

  const submitVote = async (choiceId: string) => {
    if (!gameState.currentSession || !currentUser) return;

    try {
      await submitStudentVote(gameState.currentSession.id!, currentUser.uid, choiceId);
      
      toast({
        title: 'Vote submitted',
        description: 'Your choice has been recorded',
      });
    } catch (error: any) {
      console.error('Error submitting vote:', error);
      toast({
        title: 'Failed to submit vote',
        description: error.message || 'Please try again',
        variant: 'destructive'
      });
    }
  };

  const switchMode = (mode: 'individual' | 'classroom') => {
    if (mode === 'classroom' && userProfile?.role === 'guest') {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to use classroom mode',
        variant: 'destructive'
      });
      return;
    }

    setGameState(prev => ({
      ...prev,
      gameMode: mode
    }));
  };

  const resetGame = () => {
    setGameState(initialGameState);
  };

  const endGame = () => {
    setGameState(prev => ({ ...prev, isEnded: true }));
  };

  const setCurrentClassroom = (classroom: any) => {
    setGameState(prev => ({
      ...prev,
      currentClassroom: classroom
    }));
  };

  const value: GameContextType = {
    gameState,
    startScenario,
    makeChoice,
    resetGame,
    switchMode,
    joinClassroomSession,
    submitVote,
    endGame,
    setCurrentClassroom,
    scenarios: scenarios
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
