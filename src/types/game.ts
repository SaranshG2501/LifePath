
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
  metricChanges?: MetricChange;
  tooltip?: string;
};

export type Scene = {
  id: string;
  title: string;
  description: string;
  image?: string;
  choices: Choice[];
  isEnding?: boolean;
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
  choices: {
    sceneId: string;
    choiceId: string;
    text?: string;
    timestamp: Date;
    metricChanges?: Record<string, number>;
  }[];
  isActive: boolean;
  startTime: Date | null;
};

export type GameMode = "individual" | "classroom";
export type UserRole = "student" | "teacher" | "guest";

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

export type UserProfile = {
  id: string;
  displayName: string;
  email: string;
  role: UserRole;
  xp: number;
  level: number;
  completedScenarios: string[];
  badges: Array<{id: string; title: string; awardedAt: any}>;
  classrooms?: string[];
  metrics?: Metrics;
};

export type Classroom = {
  id: string;
  name: string;
  teacherId: string;
  teacherName: string;
  students: Array<{
    id: string;
    name: string;
    joinedAt: any;
  }>;
  activeScenario?: string | null;
  currentScene?: string | null;
  createdAt: any;
  classCode: string;
  isActive: boolean;
};

export type VoteStats = {
  choiceId: string;
  count: number;
  percentage: number;
};

export interface ScenarioHistoryDetailProps {
  history: any;
}
