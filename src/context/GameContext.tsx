
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
  LiveSession,
  onClassroomUpdated
} from '../lib/firebase';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Scenario, Scene, Choice, UserRole, Metrics } from '../types/game';

interface GameState {
  currentScenario: Scenario | null;
  currentScene: Scene | null;
  sceneIndex: number;
  choices: ScenarioChoice[];
  metrics: Metrics;
  gameMode: 'individual' | 'classroom';
  isEnded: boolean;
  currentClassroom?: any;
  currentSession?: LiveSession | null;
  isConnectedToSession: boolean;
  history: {
    sceneId: string;
    choiceId: string;
    metricChanges: any;
  }[];
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
  
  // Additional properties that components expect
  isGameActive: boolean;
  showMirrorMoment: boolean;
  gameMode: 'individual' | 'classroom';
  setGameMode: (mode: 'individual' | 'classroom') => void;
  userRole: UserRole;
  classroomId: string | null;
  mirrorMomentsEnabled: boolean;
  toggleMirrorMoments: () => void;
  setCurrentScene: (sceneId: string) => void;
  loadScenario: (scenarioId: string) => Promise<void>;
  currentMirrorQuestion: string;
  setShowMirrorMoment: (show: boolean) => void;
  classroomVotes: Record<string, number>;
  revealVotes: boolean;
  setRevealVotes: (reveal: boolean) => void;
  setClassroomId: (id: string | null) => void;
  setUserRole: (role: UserRole) => void;
  canPlayScenarios: boolean;
  isModeLocked: boolean; // NEW: Track if mode is locked during sessions
  playAgain: () => void; // NEW: Properly handle replay
}

const initialGameState: GameState = {
  currentScenario: null,
  currentScene: null,
  sceneIndex: 0,
  choices: [],
  metrics: { health: 50, money: 50, happiness: 50, knowledge: 50, relationships: 50 },
  gameMode: 'individual',
  isEnded: false,
  currentClassroom: null,
  currentSession: null,
  isConnectedToSession: false,
  history: []
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [showMirrorMoment, setShowMirrorMoment] = useState(false);
  const [mirrorMomentsEnabled, setMirrorMomentsEnabled] = useState(true);
  const [classroomVotes, setClassroomVotes] = useState<Record<string, number>>({});
  const [revealVotes, setRevealVotes] = useState(false);
  const [classroomId, setClassroomId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('student');
  const [isModeLocked, setIsModeLocked] = useState(false);
  const { currentUser, userProfile, refreshUserProfile } = useAuth();
  const { toast } = useToast();

  // Derived values
  const isGameActive = gameState.currentScenario !== null;
  const currentMirrorQuestion = "What are you thinking about this decision?";

  // Check if user can play scenarios
  const canPlayScenarios = React.useMemo(() => {
    console.log("Checking canPlayScenarios...");
    console.log("- currentUser:", !!currentUser);
    console.log("- userProfile:", userProfile);
    console.log("- gameMode:", gameState.gameMode);
    console.log("- currentSession:", !!gameState.currentSession);
    
    if (!currentUser || !userProfile) {
      console.log("- Result: false (no user or profile)");
      return false;
    }
    
    if (userProfile.role === 'guest') {
      console.log("- Result: false (guest role)");
      return false;
    }
    
    if (gameState.gameMode === 'individual') {
      console.log("- Result: true (individual mode)");
      return true;
    }
    
    if (gameState.gameMode === 'classroom' && gameState.currentSession?.status === 'active') {
      console.log("- Result: false (active classroom session)");
      return false;
    }
    
    console.log("- Result: true (default)");
    return true;
  }, [currentUser, userProfile, gameState.gameMode, gameState.currentSession]);

  // Listen for classroom updates to detect live sessions
  useEffect(() => {
    if (classroomId && currentUser && userProfile?.role === 'student') {
      console.log("Setting up classroom listener for live sessions");
      
      const unsubscribe = onClassroomUpdated(classroomId, (classroom) => {
        console.log("Classroom updated:", classroom);
        
        // Check if a live session just started
        if (classroom.liveSessionActive && !gameState.currentSession) {
          console.log("Live session detected, showing notification");
          
          toast({
            title: "🎯 Live Session Started!",
            description: "Your teacher has started a live session. Join now!",
            duration: 10000,
          });
        }
      });

      return unsubscribe;
    }
  }, [classroomId, currentUser, userProfile, gameState.currentSession, toast]);

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
    console.log("Starting scenario:", scenarioId);
    console.log("Can play scenarios:", canPlayScenarios);
    
    if (!canPlayScenarios) {
      toast({
        title: "Access Restricted",
        description: "Please sign in to play scenarios or wait for the current classroom session to end.",
        variant: "destructive",
      });
      return;
    }

    const scenario = scenarios.find(s => s.id === scenarioId);
    if (!scenario) {
      console.error('Scenario not found');
      toast({
        title: "Error",
        description: "Scenario not found. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setGameState(prev => ({
      ...prev,
      currentScenario: scenario,
      currentScene: scenario.scenes[0],
      sceneIndex: 0,
      choices: [],
      metrics: scenario.initialMetrics,
      isEnded: false
    }));
    
    console.log("Scenario started successfully");
  };

  const loadScenario = async (scenarioId: string) => {
    console.log("Loading scenario:", scenarioId);
    
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
      metrics: scenario.initialMetrics,
      isEnded: false
    }));
    
    console.log("Scenario loaded successfully");
  };

  const setCurrentScene = (sceneId: string) => {
    if (!gameState.currentScenario) return;
    
    const scene = gameState.currentScenario.scenes.find(s => s.id === sceneId);
    if (scene) {
      setGameState(prev => ({ ...prev, currentScene: scene }));
    }
  };

  const makeChoice = async (choiceId: string) => {
    console.log("Making choice:", choiceId);
    
    if (!canPlayScenarios) {
      toast({
        title: "Access Restricted",
        description: "You cannot make choices at this time.",
        variant: "destructive",
      });
      return;
    }

    if (!gameState.currentScene || !gameState.currentScenario) {
      console.error("No current scene or scenario");
      return;
    }

    const choice = gameState.currentScene.choices.find(c => c.id === choiceId);
    if (!choice) {
      console.error("Choice not found");
      return;
    }

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

    const newMetrics: Metrics = {
      health: Math.max(0, Math.min(100, gameState.metrics.health + (choice.metricChanges.health || 0))),
      money: Math.max(0, Math.min(100, gameState.metrics.money + (choice.metricChanges.money || 0))),
      happiness: Math.max(0, Math.min(100, gameState.metrics.happiness + (choice.metricChanges.happiness || 0))),
      knowledge: Math.max(0, Math.min(100, gameState.metrics.knowledge + (choice.metricChanges.knowledge || 0))),
      relationships: Math.max(0, Math.min(100, gameState.metrics.relationships + (choice.metricChanges.relationships || 0)))
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
          metrics: newMetrics
        }));
      }
    } else {
      await endGameWithResults(newChoices, newMetrics);
    }
  };

  const endGameWithResults = async (finalChoices: ScenarioChoice[], finalMetrics: Metrics) => {
    console.log("Ending game with results...");
    
    setGameState(prev => ({
      ...prev,
      isEnded: true,
      choices: finalChoices,
      metrics: finalMetrics
    }));

    if (currentUser && gameState.currentScenario) {
      try {
        // Convert Metrics to the format expected by Firebase
        const firebaseMetrics = {
          environmental: finalMetrics.health + finalMetrics.knowledge,
          social: finalMetrics.happiness + finalMetrics.relationships,
          economic: finalMetrics.money
        };

        console.log("Saving scenario history to Firebase...");
        await saveScenarioHistory(
          currentUser.uid,
          gameState.currentScenario.id,
          gameState.currentScenario.title,
          finalChoices,
          firebaseMetrics
        );

        if (userProfile) {
          const updatedProfile: Partial<UserProfile> = {
            xp: (userProfile.xp || 0) + 100,
            level: Math.floor(((userProfile.xp || 0) + 100) / 500) + 1,
            completedScenarios: [...(userProfile.completedScenarios || []), gameState.currentScenario.id]
          };
          
          console.log("Updating user profile...");
          await updateUserProfile(currentUser.uid, updatedProfile);
          
          // Force refresh user profile to update UI immediately
          if (refreshUserProfile) {
            console.log("Refreshing user profile...");
            await refreshUserProfile();
          }
        }

        toast({
          title: 'Scenario Complete!',
          description: `You earned 100 XP! Check your profile for updated progress.`,
        });
      } catch (error) {
        console.error('Error saving game results:', error);
        toast({
          title: 'Error',
          description: 'Failed to save your progress. Please try again.',
          variant: 'destructive'
        });
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

      setIsModeLocked(true); // Lock mode during session

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
    console.log("Switching to mode:", mode);
    
    // Prevent mode switching if locked (during live session)
    if (isModeLocked) {
      toast({
        title: 'Mode locked',
        description: 'Cannot switch modes during a live session',
        variant: 'destructive'
      });
      return;
    }
    
    if (mode === 'classroom' && (!currentUser || !userProfile || userProfile.role === 'guest')) {
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

  const setGameMode = (mode: 'individual' | 'classroom') => {
    switchMode(mode);
  };

  const toggleMirrorMoments = () => {
    setMirrorMomentsEnabled(!mirrorMomentsEnabled);
  };

  const resetGame = () => {
    console.log("Resetting game completely...");
    setGameState(initialGameState);
    setShowMirrorMoment(false);
    setIsModeLocked(false); // Unlock mode when resetting
  };

  // NEW: Proper play again functionality
  const playAgain = () => {
    console.log("Playing again...");
    
    if (gameState.currentScenario) {
      const scenario = gameState.currentScenario;
      
      setGameState(prev => ({
        ...prev,
        currentScene: scenario.scenes[0],
        sceneIndex: 0,
        choices: [],
        metrics: scenario.initialMetrics,
        isEnded: false,
        history: []
      }));

      console.log("Game reset for replay");
    }
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
    scenarios: scenarios,
    isGameActive,
    showMirrorMoment,
    gameMode: gameState.gameMode,
    setGameMode,
    userRole: userProfile?.role || userRole,
    classroomId,
    mirrorMomentsEnabled,
    toggleMirrorMoments,
    setCurrentScene,
    loadScenario,
    currentMirrorQuestion,
    setShowMirrorMoment,
    classroomVotes,
    revealVotes,
    setRevealVotes,
    setClassroomId,
    setUserRole,
    canPlayScenarios,
    isModeLocked,
    playAgain
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

// Export useGameContext as an alias for useGame for backward compatibility
export const useGameContext = useGame;
