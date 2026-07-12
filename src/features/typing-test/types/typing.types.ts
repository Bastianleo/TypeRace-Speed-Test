export type TestDuration = 30 | 60 | 120 | 300 | "custom";

export type Difficulty = "easy" | "medium" | "hard" | "expert" | "custom";

export type TextLanguage =
  | "indonesia"
  | "english"
  | "programming"
  | "random-words"
  | "article"
  | "novel"
  | "quotes"
  | "custom";

export type ProgrammingLanguage =
  | "javascript"
  | "typescript"
  | "python"
  | "java"
  | "sql"
  | "html"
  | "css";

/** Status per-karakter yang diketik, dipakai untuk render highlight & heatmap */
export type CharStatus = "pending" | "correct" | "incorrect" | "current";

export interface TypedChar {
  char: string;
  status: CharStatus;
  timestampMs: number | null;
}

export interface TestConfig {
  duration: TestDuration;
  customDurationSeconds?: number;
  difficulty: Difficulty;
  language: TextLanguage;
  programmingLanguage?: ProgrammingLanguage;
  customText?: string;
}

/** Snapshot statistik pada satu titik waktu, dipakai untuk live graph WPM */
export interface WpmSnapshot {
  secondsElapsed: number;
  wpm: number;
  rawWpm: number;
}

export interface LiveStats {
  currentWpm: number;
  rawWpm: number;
  averageWpm: number;
  highestWpm: number;
  accuracy: number;
  errors: number;
  correctChars: number;
  incorrectChars: number;
  extraChars: number;
  missedChars: number;
  totalCharsTyped: number;
  wordsTyped: number;
  remainingSeconds: number;
  progressPercent: number;
  consistency: number;
  wpmHistory: WpmSnapshot[];
}

export type TestPhase = "idle" | "running" | "finished";

export interface TestResult {
  finalWpm: number;
  rawWpm: number;
  accuracy: number;
  timeSeconds: number;
  errors: number;
  correctChars: number;
  incorrectChars: number;
  consistency: number;
  grade: Grade;
  wpmHistory: WpmSnapshot[];
  completedAt: string;
}

export type Grade = "S" | "A" | "B" | "C" | "D";

/** Tombol yang harus dipetakan di virtual keyboard */
export interface KeyMapEntry {
  code: string;
  label: string;
  widthUnit?: number;
}
