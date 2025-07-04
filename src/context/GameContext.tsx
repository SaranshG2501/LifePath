import React, { createContext, useContext, useState, useEffect } from "react";
import { GameState, Scenario, Scene, Metrics, MetricChange, GameMode, UserRole } from "@/types/game";
import { scenarios } from "@/data/scenarios";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { 
  updateUserProfile, 
  getUserClassrooms, 
  saveScenarioHistory, 
  ScenarioChoice,
  ScenarioHistory,
  db
} from "@/lib/firebase";
import { Timestamp, collection, query, where, orderBy, getDocs, doc, getDoc, addDoc } from "firebase/firestore";

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
  isModeLocked: boolean;
  userStats: any;
  achievements: any[];
  scenarioHistory: ScenarioHistory[];
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
  const [isModeLocked, setIsModeLocked] = useState<boolean>(false);
  const [userStats, setUserStats] = useState({});
  const [achievements, setAchievements] = useState([]);
  const [scenarioHistory, setScenarioHistory] = useState<ScenarioHistory[]>([]);
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

  // Fetch scenario history when user changes
  useEffect(() => {
    const fetchScenarioHistory = async () => {
      if (!currentUser) {
        console.log("No current user, clearing scenario history");
        setScenarioHistory([]);
        return;
      }
      
      try {
        console.log("Fetching scenario history for user:", currentUser.uid);
        const historyRef = collection(db, 'scenarioHistory');
        const q = query(
          historyRef,
          where('userId', '==', currentUser.uid),
          orderBy('completedAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const history: ScenarioHistory[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          console.log("Processing scenario history document:", doc.id, data);
          history.push({
            scenarioId: data.scenarioId,
            scenarioTitle: data.scenarioTitle,
            completedAt: data.completedAt,
            choices: data.choices || [],
            finalMetrics: data.finalMetrics || {}
          });
        });
        
        console.log("Final fetched scenario history:", history);
        setScenarioHistory(history);
      } catch (error) {
        console.error("Error fetching scenario history:", error);
        
        // Fallback: try to get from user profile
        try {
          console.log("Trying fallback method - getting from user profile");
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const userHistory = userData.history || [];
            console.log("Found history in user profile:", userHistory);
            
            const formattedHistory: ScenarioHistory[] = userHistory.map((item: any) => ({
              scenarioId: item.scenarioId,
              scenarioTitle: item.scenarioTitle,
              completedAt: item.completedAt,
              choices: item.choices || [],
              finalMetrics: item.finalMetrics || {}
            }));
            
            setScenarioHistory(formattedHistory);
          } else {
            setScenarioHistory([]);
          }
        } catch (fallbackError) {
          console.error("Fallback method also failed:", fallbackError);
          setScenarioHistory([]);
        }
      }
    };
    
    fetchScenarioHistory();
  }, [currentUser]);

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

    // Lock mode when scenario starts
    setIsModeLocked(true);

    const startingMetrics = { ...scenario.initialMetrics };
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
          ? "You're leading this scenario. Students will follow your progress." 
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
      
      console.log("Saving scenario history - Current user:", currentUser.uid);
      console.log("Saving scenario history - Scenario:", gameState.currentScenario.id, gameState.currentScenario.title);
      console.log("Saving scenario history - Choices:", allChoices);
      console.log("Saving scenario history - Final metrics:", newMetrics);
      
      // Save completed scenario to both collections
      const saveToFirestore = async () => {
        try {
          // Save to scenarioHistory collection
          const historyData = {
            userId: currentUser.uid,
            scenarioId: gameState.currentScenario!.id,
            scenarioTitle: gameState.currentScenario!.title,
            completedAt: Timestamp.now(),
            choices: allChoices,
            finalMetrics: newMetrics
          };
          
          await addDoc(collection(db, 'scenarioHistory'), historyData);
          console.log("Saved to scenarioHistory collection");
          
          // Also save to user profile for backward compatibility
          await saveScenarioHistory(
            currentUser.uid,
            gameState.currentScenario!.id,
            gameState.currentScenario!.title,
            allChoices,
            newMetrics
          );
          console.log("Saved to user profile");
          
        } catch (error) {
          console.error("Error saving scenario history:", error);
          throw error;
        }
      };
      
      saveToFirestore().then(() => {
        console.log("Scenario history saved successfully");
        toast({
          title: "Scenario Completed",
          description: "Your choices have been saved to your profile.",
        });
        
        // Refresh scenario history after saving
        setTimeout(async () => {
          try {
            const historyRef = collection(db, 'scenarioHistory');
            const q = query(
              historyRef,
              where('userId', '==', currentUser.uid),
              orderBy('completedAt', 'desc')
            );
            
            const querySnapshot = await getDocs(q);
            const history: ScenarioHistory[] = [];
            
            querySnapshot.forEach((doc) => {
              const data = doc.data();
              history.push({
                scenarioId: data.scenarioId,
                scenarioTitle: data.scenarioTitle,
                completedAt: data.completedAt,
                choices: data.choices || [],
                finalMetrics: data.finalMetrics || {}
              });
            });
            
            console.log("Refreshed scenario history after save:", history);
            setScenarioHistory(history);
          } catch (error) {
            console.error("Error refreshing scenario history:", error);
          }
        }, 1000);
      }).catch(error => {
        console.error("Error saving scenario history:", error);
        toast({
          title: "Save Error",
          description: "Failed to save your progress. Please check your connection.",
          variant: "destructive",
        });
      });
    }

    // Reset mirror moment and votes state
    setShowMirrorMoment(false);
    setRevealVotes(false);
    setClassroomVotes({});
  };

  const resetGame = () => {
    setGameState(initialGameState);
    setIsGameActive(false);
    setShowMirrorMoment(false);
    setRevealVotes(false);
    setClassroomVotes({});
    setScenarioChoices([]);
    setIsModeLocked(false); // Unlock mode when game resets
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

  const setGameModeWithLock = (mode: GameMode) => {
    if (isModeLocked) {
      toast({
        title: "Mode Locked",
        description: "Cannot change mode while a scenario is active.",
        variant: "destructive",
      });
      return;
    }
    
    // Prevent guests from accessing classroom mode
    if (mode === "classroom" && userRole === "guest") {
      toast({
        title: "Login Required",
        description: "Please sign up or login to use classroom mode.",
        variant: "destructive",
      });
      return;
    }
    
    // Prevent students from accessing classroom mode without joining a classroom
    if (mode === "classroom" && userRole === "student" && !hasJoinedClassroom) {
      toast({
        title: "Join Classroom Required",
        description: "You need to join a classroom before using squad mode.",
        variant: "destructive",
      });
      return;
    }
    
    setGameMode(mode);
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
        setGameMode: setGameModeWithLock,
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
        setCurrentScene,
        isModeLocked,
        userStats,
        achievements,
        scenarioHistory
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
