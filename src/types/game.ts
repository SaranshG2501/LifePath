
export interface Scenario {
  id: string;
  title: string;
  description: string;
  category: string;
  ageGroup: string;
  duration: string;
  image: string;
  scenes: Scene[];
  initialMetrics: Metrics;
}

export interface Scene {
  id: string;
  title: string;
  content: string;
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
}
