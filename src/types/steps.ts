export interface BaseStep {
  id: string;
  type: StepType;
  title?: string;
  description?: string;
  orderIndex: number;
}

export enum StepType {
  QUESTION_SINGLE_CHOICE = 'QUESTION_SINGLE_CHOICE',
  QUESTION_MULTIPLE_CHOICE = 'QUESTION_MULTIPLE_CHOICE',
  TEXT_INPUT = 'TEXT_INPUT',
  TEXT_REFLECTION = 'TEXT_REFLECTION',
  INFORMATION = 'INFORMATION',
  MEDIA = 'MEDIA',
}

export interface SingleChoiceQuestion extends BaseStep {
  type: StepType.QUESTION_SINGLE_CHOICE;
  question: string;
  options: Array<{
    id: string;
    text: string;
    value: string | number;
  }>;
  required?: boolean;
}

export interface MultipleChoiceQuestion extends BaseStep {
  type: StepType.QUESTION_MULTIPLE_CHOICE;
  question: string;
  options: Array<{
    id: string;
    text: string;
    value: string | number;
  }>;
  minSelections?: number;
  maxSelections?: number;
  required?: boolean;
}

export interface TextInput extends BaseStep {
  type: StepType.TEXT_INPUT;
  question: string;
  placeholder?: string;
  maxLength?: number;
  minLength?: number;
  required?: boolean;
}

export interface TextReflection extends BaseStep {
  type: StepType.TEXT_REFLECTION;
  introText?: string;
  prompts: Array<{
    id: string;
    text: string;
    placeholder?: string;
  }>;
  required?: boolean;
}

export interface Information extends BaseStep {
  type: StepType.INFORMATION;
  content: string;
  acknowledgmentRequired?: boolean;
}

export interface Media extends BaseStep {
  type: StepType.MEDIA;
  mediaType: 'image' | 'video' | 'audio';
  url: string;
  caption?: string;
  acknowledgmentRequired?: boolean;
}

export type Step = 
  | SingleChoiceQuestion
  | MultipleChoiceQuestion
  | TextInput
  | TextReflection
  | Information
  | Media;

export interface ConditionalBranching {
  stepId: string;
  conditions: Array<{
    field: string;
    operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
    value: any;
  }>;
  nextStepId: string;
}

export interface Exercise {
  id: string;
  name: string;
  description?: string;
  steps: Step[];
  conditionalBranching?: ConditionalBranching[];
}

export interface SingleChoiceQuestionResponse {
  selectedOptionId: string;
}

export interface MultipleChoiceQuestionResponse {
  selectedOptionIds: string[];
}

export interface TextInputResponse {
  text: string;
}

export interface TextReflectionResponse {
  reflections: Array<{
    promptId: string;
    text: string;
  }>;
}

export interface InformationResponse {
  acknowledged: boolean;
}

export interface MediaResponse {
  acknowledged: boolean;
  watchTimeSeconds?: number;
}

export type StepResponse =
  | SingleChoiceQuestionResponse
  | MultipleChoiceQuestionResponse
  | TextInputResponse
  | TextReflectionResponse
  | InformationResponse
  | MediaResponse;
