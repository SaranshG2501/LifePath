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
};

export type ClassroomSession = {
  id: string;
  code: string;
  name: string;
  teacherId: string;
  teacherName: string;
  scenarioId: string | null;
  currentSceneId: string | null;
  status: 'waiting' | 'active' | 'paused' | 'ended';
  createdAt: any;
  participants: string[];
};

export type ClassroomParticipant = {
  id: string;
  userId: string;
  username: string;
  joinedAt: any;
  isActive: boolean;
};

export type ClassroomVote = {
  id: string;
  sessionId: string;
  sceneId: string;
  choiceId: string;
  userId: string;
  username: string;
  timestamp: any;
};

export type VoteStats = {
  choiceId: string;
  count: number;
  percentage: number;
  voters: string[];
};

export interface ScenarioCardProps {
  scenario: Scenario;
  onClick?: () => void;
}

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
};
