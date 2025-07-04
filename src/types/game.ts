
export type Metrics = {
  health: number;
  money: number;
  happiness: number;
  knowledge: number;
  relationships: number;
};

export type MetricChange = {
  [K in keyof Metrics]?: number;
};

export type Choice = {
  id: string;
  text: string;
  nextSceneId: string;
  metricChanges: MetricChange;
  tooltip?: string;
};

export type Scene = {
  id: string;
  title: string;
  description: string;
  image?: string;
  choices: Choice[];
  isEnding?: boolean;
  isEndScene?: boolean;
};

export type Scenario = {
  id: string;
  title: string;
  description: string;
  ageGroup: string;
  category: string;
  thumbnail: string;
  initialMetrics: Metrics;
  scenes: Scene[];
};

export type GameState = {
  currentScenario: Scenario | null;
  currentScene: Scene | null;
  metrics: Metrics;
  history: {
    sceneId: string;
    choiceId: string;
    metricChanges: MetricChange;
  }[];
};

export type GameMode = "individual" | "classroom";
export type UserRole = "student" | "teacher" | "guest";

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: (gameState: GameState) => boolean;
};

export type UserProfile = {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  xp: number;
  completedScenarios: string[];
  badges: string[];
  classrooms: string[];
};

export type Classroom = {
  id: string;
  name: string;
  teacherId: string;
  students: string[];
  activeScenario?: string;
};

export type VoteStats = {
  choiceId: string;
  count: number;
  percentage: number;
};

export interface ScenarioCardProps {
  scenario: Scenario;
  onClick?: () => void;
}

export interface ScenarioHistory {
  scenarioId: string;
  scenarioTitle: string;
  startedAt: Date;
  completedAt: Date;
  choices: any[];
  finalMetrics: Record<string, number>;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
}

type GameContextType = {
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
};

export default GameContextType;
