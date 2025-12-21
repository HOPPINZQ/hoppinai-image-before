
export interface TimeTravelResult {
  age: number;
  direction: 'past' | 'future';
  imageUrl: string;
  prompt: string;
}

export interface SessionState {
  originalImage: string | null;
  currentAge: number;
  results: Record<string, TimeTravelResult>;
  isProcessing: boolean;
  error: string | null;
}

export enum AgeStage {
  Child = -20,
  Teen = -10,
  Adult = 0,
  MiddleAge = 15,
  Elderly = 40,
  Ancient = 60
}
