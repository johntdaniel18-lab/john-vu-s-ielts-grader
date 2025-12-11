
export interface EssayImage {
  id: number;
  file: File;
  base64: string;
  mimeType: string;
}

export interface Improvement {
  id: number;
  originalText: string;
  issue: string; // e.g., "Word Choice", "Sentence Structure"
  category: 'Task Response' | 'Coherence and Cohesion' | 'Lexical Resource' | 'Grammatical Range and Accuracy';
  description: string;
  suggestions: string[];
  source?: 'AI' | 'Teacher';
}

export interface FeedbackCriterion {
  band: number;
  comment: string;
  details: string[];
}

export interface Feedback {
  overallBand: number;
  feedback: {
    taskResponse: FeedbackCriterion;
    coherenceCohesion: FeedbackCriterion;
    lexicalResource: FeedbackCriterion;
    grammaticalRangeAccuracy: FeedbackCriterion;
  };
  improvements: Improvement[];
}

export type TaskType = 1 | 2;

export interface User {
  uid: string;
  name: string;
  center: string;
}
