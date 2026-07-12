import type { Grade, TypedChar, WpmSnapshot } from "../types/typing.types";

/** 1 "word" standar dalam pengetikan = 5 karakter (konvensi industri) */
const CHARS_PER_WORD = 5;

export function calculateWpm(correctChars: number, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0) return 0;
  const minutes = elapsedSeconds / 60;
  return Math.round(correctChars / CHARS_PER_WORD / minutes);
}

export function calculateRawWpm(totalCharsTyped: number, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0) return 0;
  const minutes = elapsedSeconds / 60;
  return Math.round(totalCharsTyped / CHARS_PER_WORD / minutes);
}

export function calculateAccuracy(correctChars: number, totalCharsTyped: number): number {
  if (totalCharsTyped === 0) return 100;
  return Math.round((correctChars / totalCharsTyped) * 10000) / 100;
}

/**
 * Consistency dihitung dari koefisien variasi (CV) WPM sepanjang sesi.
 * Semakin rendah variasi relatif terhadap rata-rata, semakin tinggi skor.
 */
export function calculateConsistency(wpmHistory: WpmSnapshot[]): number {
  if (wpmHistory.length < 2) return 100;
  const values = wpmHistory.map((s) => s.wpm);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  if (mean === 0) return 100;
  const variance =
    values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / values.length;
  const stdDev = Math.sqrt(variance);
  const cv = stdDev / mean;
  const score = Math.max(0, 100 - cv * 100);
  return Math.round(score * 100) / 100;
}

export function countCharStatuses(chars: TypedChar[]) {
  let correct = 0;
  let incorrect = 0;
  for (const c of chars) {
    if (c.status === "correct") correct++;
    if (c.status === "incorrect") incorrect++;
  }
  return { correct, incorrect };
}

export function calculateGrade(wpm: number, accuracy: number): Grade {
  const score = wpm * (accuracy / 100);
  if (score >= 90 && accuracy >= 97) return "S";
  if (score >= 70 && accuracy >= 92) return "A";
  if (score >= 50 && accuracy >= 85) return "B";
  if (score >= 30) return "C";
  return "D";
}
