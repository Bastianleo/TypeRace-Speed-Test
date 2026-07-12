export type RoomStatus = "waiting" | "countdown" | "racing" | "finished";
export type RoomLanguage =
  | "indonesia"
  | "english"
  | "programming"
  | "random_words"
  | "japanese"
  | "korean"
  | "spanish"
  | "french"
  | "german"
  | "portuguese"
  | "arabic"
  | "chinese"
  | "russian"
  | "italian"
  | "dutch"
  | "polish"
  | "turkish"
  | "vietnamese"
  | "thai"
  | "hindi"
  | "code_javascript"
  | "code_python"
  | "code_java"
  | "code_cpp"
  | "code_sql"
  | "quotes"
  | "novel"
  | "article"
  | "pangram"
  | "numbers";
export type RoomDifficulty = "easy" | "medium" | "hard" | "expert";

export interface RoomSettings {
  durationSeconds: number;
  difficulty: RoomDifficulty;
  language: RoomLanguage;
  maxPlayers: number;
}

export interface Player {
  id: string;
  username: string;
  country: string;
  progress: number; // 0-100
  wpm: number;
  accuracy: number;
  isFinished: boolean;
  finishRank?: number;
  isBot?: boolean;
}

export interface Room {
  id: string;
  code: string;
  status: RoomStatus;
  players: Player[];
  maxPlayers: number;
  targetText: string;
  countdown?: number;
  settings?: RoomSettings;
}
