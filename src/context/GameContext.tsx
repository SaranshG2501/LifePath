import React, { createContext, useContext, useState, useEffect } from "react";
import { GameState, Scenario, Scene, Metrics, MetricChange, GameMode, UserRole } from "@/types/game";
import { scenarios } from "@/data/scenarios";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { 
  updateUserProfile, 
  getUserClassrooms, 
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
  gameMode: GameMode;
  setGameMode: (mode: GameMode) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  classroomId: string | null;
  setClassroomId: (id: string | null) => void;
  showMirrorMoment: boolean;
  setShowMirrorMoment: (show: boolean) => void;
  currentMirrorQuestion: string | null;
  classroomVotes: Record<string, number>;
  submitVote: (choiceId: string) => void;
  revealVotes: boolean;
  setRevealVotes: (reveal: boolean) => void;
  toggleMirrorMoments: () => void;
  mirrorMomentsEnabled: boolean;
  hasJoinedClassroom: boolean;
  setCurrentScene: (sceneId: string) => void;
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
  const [gameMode, setGameMode] = useState<GameMode>("individual");
  const [userRole, setUserRole] = useState<UserRole>("student");
  const [classroomId, setClassroomId] = useState<string | null>(null);
  const [showMirrorMoment, setShowMirrorMoment] = useState<boolean>(false);
  const [currentMirrorQuestion, setCurrentMirrorQuestion] = useState<string | null>(null);
  const [classroomVotes, setClassroomVotes] = useState<Record<string, number>>({});
  const [revealVotes, setRevealVotes] = useState<boolean>(false);
  const [mirrorMomentsEnabled, setMirrorMomentsEnabled] = useState<boolean>(true);
  const [hasJoinedClassroom, setHasJoinedClassroom] = useState<boolean>(false);
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

  // Check if user has joined any classroom
  useEffect(() => {
    const checkClassroomStatus = async () => {
      if (!currentUser || !userProfile) return;
      
      try {
        const userClassrooms = await getUserClassrooms(currentUser.uid, userProfile.role || 'student');
        setHasJoinedClassroom(userClassrooms.length > 0);
        
        // If user has classrooms but no active classroom selected, set the first one
        if (userClassrooms.length > 0 && !classroomId) {
          setClassroomId(userClassrooms[0].id);
        }
      } catch (error) {
        console.error("Error checking classroom status:", error);
      }
    };
    
    checkClassroomStatus();
  }, [currentUser, userProfile, classroomId, setClassroomId]);

  // Set game mode to individual if user has no classroom
  useEffect(() => {
    if (userRole === 'student' && !hasJoinedClassroom && gameMode === 'classroom') {
      setGameMode('individual');
      if (!classroomId) {
        toast({
          title: "Classroom Required",
          description: "You need to join a classroom before using classroom mode.",
        });
      }
    }
  }, [hasJoinedClassroom, gameMode, userRole, classroomId, toast]);

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

    // Validate classroom mode
    if (gameMode === "classroom") {
      // Students need to be in a classroom
      if (userRole === "student" && !classroomId) {
        toast({
          title: "Classroom Required",
          description: "Please join a classroom before starting a scenario in classroom mode.",
          variant: "destructive",
        });
        return;
      }
      
      // Teachers need to have created a classroom
      if (userRole === "teacher" && !classroomId) {
        toast({
          title: "Classroom Required",
          description: "Please create a classroom before starting a scenario in classroom mode.",
          variant: "destructive",
        });
        return;
      }
    }

    // Start with scenario's default metrics rather than user's saved metrics
    const startingMetrics = { ...scenario.initialMetrics };

    // Reset scenario choices for new scenario
    setScenarioChoices([]);

    setGameState({
      currentScenario: scenario,
      currentScene: firstScene,
      metrics: startingMetrics,
      history: []
    });
    setIsGameActive(true);
    setShowMirrorMoment(false);
    setRevealVotes(false);
    setClassroomVotes({});

    if (gameMode === "classroom") {
      toast({
        title: "Classroom Mode Active",
        description: userRole === "teacher" 
          ? "You're leading this scenario. Students can join with your classroom code." 
          : "You're participating in a classroom activity.",
      });
    }
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

    // For classroom mode, collect votes instead of immediately proceeding
    if (gameMode === "classroom" && userRole === "teacher" && !revealVotes) {
      // In a real app, this would communicate with backend
      // For demo, we'll simulate votes
      const newVotes = { ...classroomVotes };
      newVotes[choiceId] = (newVotes[choiceId] || 0) + 1;
      setClassroomVotes(newVotes);
      setRevealVotes(true);
      
      toast({
        title: "Votes collected",
        description: "You can now discuss the results with your class.",
      });
      
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

    console.log("Updated metrics:", newMetrics);

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
    if (currentUser && gameMode === "individual") {
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
        toast({
          title: "Scenario Completed",
          description: "Your choices have been saved to your profile.",
        });
        
        // Refresh user profile to get updated data
        refreshUserProfile();
      }).catch(error => {
        console.error("Error saving scenario history:", error);
      });
    }

    // Reset mirror moment and votes state
    setShowMirrorMoment(false);
    setRevealVotes(false);
    setClassroomVotes({});
    
    // Removed the metrics changes toast
  };

  const resetGame = () => {
    setGameState(initialGameState);
    setIsGameActive(false);
    setShowMirrorMoment(false);
    setRevealVotes(false);
    setClassroomVotes({});
    setScenarioChoices([]);
  };

  const submitVote = (choiceId: string) => {
    if (gameMode === "classroom" && gameState.currentScene) {
      // Validate student is in a classroom
      if (userRole === "student" && !classroomId) {
        toast({
          title: "Classroom Required",
          description: "Please join a classroom before voting.",
          variant: "destructive",
        });
        return;
      }
      
      const newVotes = { ...classroomVotes };
      newVotes[choiceId] = (newVotes[choiceId] || 0) + 1;
      setClassroomVotes(newVotes);
      
      toast({
        title: "Vote submitted",
        description: "Waiting for other students to vote.",
      });
    }
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

  // Add setCurrentScene function
  const setCurrentScene = (sceneId: string) => {
    if (!gameState.currentScenario) return;
    
    const scene = gameState.currentScenario.scenes.find(s => s.id === sceneId);
    if (scene) {
      setGameState(prev => ({
        ...prev,
        currentScene: scene
      }));
    }
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
        gameMode,
        setGameMode,
        userRole,
        setUserRole,
        classroomId,
        setClassroomId,
        showMirrorMoment,
        setShowMirrorMoment,
        currentMirrorQuestion,
        classroomVotes,
        submitVote,
        revealVotes,
        setRevealVotes,
        toggleMirrorMoments,
        mirrorMomentsEnabled,
        hasJoinedClassroom,
        setCurrentScene
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
