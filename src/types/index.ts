export type Mode = "fluency" | "impromptu" | "group" | "interview";
export type Level = "beginner" | "intermediate" | "advanced";
export type InterviewType = "hr" | "behavioural" | "technical";
export type Difficulty = "easy" | "medium" | "hard";
export type Category =
  | "technology"
  | "education"
  | "current-affairs"
  | "social-issues"
  | "business"
  | "everyday-life";

export interface TranscriptEntry {
  id: string;
  role: "learner" | "coach";
  text: string;
}

export interface Topic {
  id: string;
  category: Category;
  difficulty: Difficulty;
  title: string;
  prompt: string;
}

export interface Correction {
  original: string;
  improved: string;
  explanation: string;
}

export interface VocabSuggestion extends Correction {
  example: string;
}

export interface FeedbackReport {
  summary: string;
  scores: {
    clarity: number;
    grammar: number;
    organization: number;
    vocabulary: number;
    relevance?: number | null;
  };
  corrections: Correction[];
  vocabulary: VocabSuggestion[];
  strengths: string[];
  improvements: string[];
  nextExercises: string[];
}

/** Purely measurable statistics computed in the browser. No AI involved. */
export interface LocalFeedback {
  wordCount: number;
  turns: number;
  avgWordsPerTurn: number;
  longestTurnWords: number;
  fillers: { phrase: string; count: number }[];
  repeated: { word: string; count: number }[];
  tips: string[];
}

export type SessionFeedback =
  | { source: "ai"; notice: string; report: FeedbackReport }
  | { source: "local"; notice: string; stats: LocalFeedback };

export interface SessionConfig {
  mode: Mode;
  level: Level;
  durationMinutes: number;
  topic?: string;
  role?: string;
  interviewType?: InterviewType;
}

export interface SessionRecord {
  id: string;
  config: SessionConfig;
  startedAt: string;
  durationSeconds: number;
  /** "voice" = live Vapi call. "text-demo" = typed demo session. */
  channel: "voice" | "text-demo";
  transcript: TranscriptEntry[];
  feedback?: SessionFeedback;
}

export type TextSize = "normal" | "large" | "xlarge";

export interface Settings {
  level: Level;
  preferredMode: Mode;
  durationMinutes: number;
  textSize: TextSize;
  /** null = not asked yet. Sessions are only stored in this browser when true. */
  saveHistory: boolean | null;
}

export interface Capabilities {
  voice: boolean;
  ai: boolean;
}
