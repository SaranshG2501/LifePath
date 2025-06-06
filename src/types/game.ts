
export interface Scenario {
  id: string;
  title: string;
  description: string;
  category: string;
  ageGroup: string;
  duration?: string;
  image?: string;
  thumbnail?: string;
  scenes: Scene[];
  initialMetrics: Metrics;
}

export interface Scene {
  id: string;
  title: string;
  content?: string; // Make content optional since we're using description
  description?: string;
  choices: Choice[];
  image?: string;
  isEnding?: boolean;
}

export interface Choice {
  id: string;
  text: string;
  nextSceneId?: string;
  metricChanges: MetricChanges;
  sceneId?: string;
  choiceId?: string;
  choiceText?: string;
  timestamp?: any;
  tooltip?: string;
}

export interface MetricChanges {
  health?: number;
  money?: number;
  happiness?: number;
  knowledge?: number;
  relationships?: number;
}

export interface Metrics {
  health: number;
  money: number;
  happiness: number;
  knowledge: number;
  relationships: number;
}

export interface GameState {
  currentScenario: Scenario | null;
  currentScene: Scene | null;
  metrics: Metrics;
  history: Choice[];
  isComplete: boolean;
}

export type UserRole = 'student' | 'teacher' | 'guest';

export interface Classroom {
  id?: string;
  name: string;
  code: string;
  classCode: string;
  teacherId: string;
  teacherName: string;
  members: string[];
  createdAt: Date;
  activeSessionId?: string;
  liveSessionActive?: boolean;
}

export interface ScenarioCompletion {
  scenarioId: string;
  title: string;
  completedAt: Date;
  score?: number;
  choices: any[];
  metrics: {
    environmental: number;
    social: number;
    economic: number;
  };
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  lastLogin?: Date;
  xp?: number;
  level?: number;
  completedScenarios?: string[];
  scenarioHistory?: ScenarioCompletion[];
  classrooms?: string[];
  achievements?: string[];
}
