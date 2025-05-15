import { Exercise } from './steps';

export interface Intervention {
  id: string;
  name: string;
  description?: string;
  condition?: string;
  priority: number;
  isActive: boolean;
  exercises: Exercise[];
  translations?: LocalizedContent[];
}

export interface DailyData {
  id: string;
  userId: string;
  date: Date;
  stressLevel?: number;
  sleepHours?: number;
  activitySteps?: number;
  activityMinutes?: number;
}

export interface LocalizedContent {
  language: string;
  content: any;
}

export interface UserInteraction {
  id: string;
  userId: string;
  interventionId: string;
  date: Date;
  completed: boolean;
  startedAt: Date;
  completedAt?: Date;
  responses: Array<{
    stepId: string;
    response: any;
  }>;
}

export interface InterventionResponse {
  intervention: Intervention;
  interactionId: string;
}
