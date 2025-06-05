

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
  displayName?: string;
  level?: number;
};

export type Classroom = {
  id: string;
  name: string;
  teacherId: string;
  students: string[];
  activeScenario?: string;
  classCode: string;
  teacherName: string;
  createdAt: any;
  members: string[];
  activeSessionId?: string;
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
