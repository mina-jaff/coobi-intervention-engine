import { StepResponse } from './steps';
import { Intervention } from './interventions';

export interface RecordStepResponseRequest {
  response: StepResponse;
}

export interface RecordStepResponseResponse {
  id: string;
  stepId: string;
  userInteractionId: string;
  response: StepResponse;
  createdAt: Date;
}

export interface GetInterventionResponse {
  intervention: Intervention | null;
  interactionId?: string;
  message?: string;
}

export interface CompleteInterventionResponse {
  id: string;
  completed: boolean;
  completedAt: Date;
}

export interface ErrorResponse {
  error: string;
  message: string;
}
