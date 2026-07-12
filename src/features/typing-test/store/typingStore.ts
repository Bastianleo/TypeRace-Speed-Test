import { create } from "zustand";
import type {
  CharStatus,
  Difficulty,
  ProgrammingLanguage,
  TestConfig,
  TestDuration,
  TestPhase,
  TestResult,
  TextLanguage,
  TypedChar,
  WpmSnapshot,
} from "../types/typing.types";
import { generateTestText } from "../utils/wordLists";
import {
  calculateAccuracy,
  calculateConsistency,
  calculateGrade,
  calculateRawWpm,
  calculateWpm,
  countCharStatuses,
} from "../utils/calculateStats";

interface TypingState {
  config: TestConfig;
  phase: TestPhase;
  targetText: string;
  typedChars: TypedChar[];
  cursorIndex: number;
  startedAtMs: number | null;
  remainingSeconds: number;
  wpmHistory: WpmSnapshot[];
  result: TestResult | null;
  nextKeyCode: string | null;

  setDuration: (duration: TestDuration, customSeconds?: number) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  setLanguage: (language: TextLanguage, programmingLanguage?: ProgrammingLanguage) => void;
  setCustomText: (text: string) => void;

  startTest: () => void;
  typeChar: (char: string) => void;
  backspace: () => void;
  tickSecond: () => void;
  finishTest: () => void;
  resetTest: () => void;
}

function durationToSeconds(config: TestConfig): number {
  if (config.duration === "custom") return config.customDurationSeconds ?? 60;
  return config.duration;
}

const initialConfig: TestConfig = {
  duration: 30,
  difficulty: "medium",
  language: "english",
};

export const useTypingStore = create<TypingState>((set, get) => ({
  config: initialConfig,
  phase: "idle",
  targetText: "",
  typedChars: [],
  cursorIndex: 0,
  startedAtMs: null,
  remainingSeconds: durationToSeconds(initialConfig),
  wpmHistory: [],
  result: null,
  nextKeyCode: null,

  setDuration: (duration, customSeconds) =>
    set((state) => {
      const config = { ...state.config, duration, customDurationSeconds: customSeconds };
      return { config, remainingSeconds: durationToSeconds(config) };
    }),

  setDifficulty: (difficulty) =>
    set((state) => ({ config: { ...state.config, difficulty } })),

  setLanguage: (language, programmingLanguage) =>
    set((state) => ({ config: { ...state.config, language, programmingLanguage } })),

  setCustomText: (customText) =>
    set((state) => ({ config: { ...state.config, customText, language: "custom" } })),

  startTest: () => {
    const { config } = get();
    const text = generateTestText(
      config.language,
      config.difficulty,
      config.programmingLanguage,
      config.customText
    );
    set({
      phase: "running",
      targetText: text,
      typedChars: [],
      cursorIndex: 0,
      startedAtMs: Date.now(),
      remainingSeconds: durationToSeconds(config),
      wpmHistory: [],
      result: null,
      nextKeyCode: text[0] ?? null,
    });
  },

  typeChar: (char) => {
    const { phase, targetText, typedChars, cursorIndex } = get();
    if (phase !== "running") return;
    if (cursorIndex >= targetText.length) return;

    const expected = targetText[cursorIndex];
    const status: CharStatus = char === expected ? "correct" : "incorrect";
    const nextChars = [...typedChars, { char, status, timestampMs: Date.now() }];
    const newCursor = cursorIndex + 1;

    set({
      typedChars: nextChars,
      cursorIndex: newCursor,
      nextKeyCode: targetText[newCursor] ?? null,
    });

    if (newCursor >= targetText.length) {
      get().finishTest();
    }
  },

  backspace: () => {
    const { typedChars, cursorIndex, targetText } = get();
    if (cursorIndex === 0) return;
    const nextChars = typedChars.slice(0, -1);
    const newCursor = cursorIndex - 1;
    set({
      typedChars: nextChars,
      cursorIndex: newCursor,
      nextKeyCode: targetText[newCursor] ?? null,
    });
  },

  tickSecond: () => {
    const { phase, startedAtMs, typedChars, remainingSeconds, wpmHistory } = get();
    if (phase !== "running" || startedAtMs === null) return;

    const elapsedSeconds = Math.max(1, Math.round((Date.now() - startedAtMs) / 1000));
    const { correct } = countCharStatuses(typedChars);
    const wpm = calculateWpm(correct, elapsedSeconds);
    const rawWpm = calculateRawWpm(typedChars.length, elapsedSeconds);

    const snapshot: WpmSnapshot = { secondsElapsed: elapsedSeconds, wpm, rawWpm };
    const newRemaining = remainingSeconds - 1;

    set({
      wpmHistory: [...wpmHistory, snapshot],
      remainingSeconds: newRemaining,
    });

    if (newRemaining <= 0) {
      get().finishTest();
    }
  },

  finishTest: () => {
    const { typedChars, startedAtMs, wpmHistory, targetText, cursorIndex } = get();
    const elapsedSeconds = startedAtMs
      ? Math.max(1, Math.round((Date.now() - startedAtMs) / 1000))
      : 1;
    const { correct, incorrect } = countCharStatuses(typedChars);
    const finalWpm = calculateWpm(correct, elapsedSeconds);
    const rawWpm = calculateRawWpm(typedChars.length, elapsedSeconds);
    const accuracy = calculateAccuracy(correct, typedChars.length);
    const consistency = calculateConsistency(wpmHistory);
    const grade = calculateGrade(finalWpm, accuracy);

    const result: TestResult = {
      finalWpm,
      rawWpm,
      accuracy,
      timeSeconds: elapsedSeconds,
      errors: incorrect,
      correctChars: correct,
      incorrectChars: incorrect,
      consistency,
      grade,
      wpmHistory,
      completedAt: new Date().toISOString(),
    };

    set({ phase: "finished", result });
    void targetText;
    void cursorIndex;
  },

  resetTest: () =>
    set((state) => ({
      phase: "idle",
      targetText: "",
      typedChars: [],
      cursorIndex: 0,
      startedAtMs: null,
      remainingSeconds: durationToSeconds(state.config),
      wpmHistory: [],
      result: null,
      nextKeyCode: null,
    })),
}));

/** Selector turunan: statistik live untuk ditampilkan real-time saat mengetik */
export function selectLiveStats(state: TypingState) {
  const { correct, incorrect } = countCharStatuses(state.typedChars);
  const elapsedSeconds = state.startedAtMs
    ? Math.max(1, Math.round((Date.now() - state.startedAtMs) / 1000))
    : 0;
  const currentWpm = calculateWpm(correct, elapsedSeconds || 1);
  const rawWpm = calculateRawWpm(state.typedChars.length, elapsedSeconds || 1);
  const accuracy = calculateAccuracy(correct, state.typedChars.length);
  const progressPercent = state.targetText.length
    ? Math.round((state.cursorIndex / state.targetText.length) * 100)
    : 0;
  const highestWpm = state.wpmHistory.reduce((max, s) => Math.max(max, s.wpm), 0);
  const averageWpm = state.wpmHistory.length
    ? Math.round(
        state.wpmHistory.reduce((sum, s) => sum + s.wpm, 0) / state.wpmHistory.length
      )
    : currentWpm;

  return {
    currentWpm,
    rawWpm,
    averageWpm,
    highestWpm: Math.max(highestWpm, currentWpm),
    accuracy,
    errors: incorrect,
    correctChars: correct,
    incorrectChars: incorrect,
    totalCharsTyped: state.typedChars.length,
    wordsTyped: Math.round(correct / 5),
    remainingSeconds: state.remainingSeconds,
    progressPercent,
    consistency: calculateConsistency(state.wpmHistory),
    wpmHistory: state.wpmHistory,
  };
}
