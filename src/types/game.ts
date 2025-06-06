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
  choices: Choice[];
  image?: string;
}

export interface Choice {
  id: string;
  text: string;
  nextSceneId?: string;
  metricChanges: MetricChanges;
}

export interface MetricChanges {
  health: number;
  money: number;
  happiness: number;
  knowledge: number;
  relationships: number;
}

export interface Metrics {
  health: number;
  money: number;
  happiness: number;
  knowledge: number;
  relationships: number;
}

export type UserRole = 'student' | 'teacher' | 'guest';

export interface Classroom {
  id?: string;
  name: string;
  classCode: string;
  teacherId: string;
  teacherName: string;
  members: string[];
  createdAt: Date;
  activeSessionId?: string;
}
