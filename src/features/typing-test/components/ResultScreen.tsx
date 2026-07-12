"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTypingStore } from "../store/typingStore";
import { useAuthStore } from "@/features/auth/store/authStore";
import type { Grade } from "../types/typing.types";

const GRADE_STYLE: Record<Grade, string> = {
  S: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  A: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  B: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  C: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  D: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
};

const LANG_MAP: Record<string, string> = {
  english: "ENGLISH",
  indonesia: "INDONESIA",
  programming: "PROGRAMMING",
  quotes: "QUOTES",
  custom: "CUSTOM",
};

const DIFF_MAP: Record<string, string> = {
  easy: "EASY",
  medium: "MEDIUM",
  hard: "HARD",
  expert: "EXPERT",
  custom: "CUSTOM",
};

interface ResultScreenProps {
  onRetry: () => void;
}

export function ResultScreen({ onRetry }: ResultScreenProps) {
  const result = useTypingStore((s) => s.result);
  const config = useTypingStore((s) => s.config);
  const { user, setUser } = useAuthStore();
  const hasSaved = useRef(false);
  const [gainedXp, setGainedXp] = useState<number | null>(null);

  useEffect(() => {
    if (!result || !user || hasSaved.current) return;
    hasSaved.current = true;

    const save = async () => {
      try {
        const res = await fetch("/api/tests/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            wpm: result.finalWpm,
            rawWpm: result.rawWpm,
            accuracy: result.accuracy,
            consistency: result.consistency,
            correctChars: result.correctChars,
            incorrectChars: result.incorrectChars,
            errors: result.errors,
            grade: result.grade,
            durationSeconds: result.timeSeconds,
            language: LANG_MAP[config.language] ?? "ENGLISH",
            difficulty: DIFF_MAP[config.difficulty] ?? "MEDIUM",
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.gainedXp !== undefined) {
            setGainedXp(data.gainedXp);
            // Update the user in store with new xp/level
            if (data.user) {
              setUser({ ...user, xp: data.user.xp, level: data.user.level });
            }
          }
        }
      } catch (_err) {
        // Silent fail — offline or DB down
      }
    };

    save();
  }, [result, user, config, setUser]);

  if (!result) return null;

  const metrics: { label: string; value: string | number }[] = [
    { label: "WPM Akhir", value: result.finalWpm },
    { label: "Raw WPM", value: result.rawWpm },
    { label: "Akurasi", value: `${result.accuracy}%` },
    { label: "Waktu", value: `${result.timeSeconds}s` },
    { label: "Karakter Benar", value: result.correctChars },
    { label: "Karakter Salah", value: result.incorrectChars },
    { label: "Konsistensi", value: `${Math.round(result.consistency)}%` },
    { label: "Error", value: result.errors },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Hasil Tes</p>
            <p className="text-2xl font-semibold">Selesai</p>
          </div>
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-xl border text-xl font-bold ${GRADE_STYLE[result.grade]}`}
            aria-label={`Grade ${result.grade}`}
          >
            {result.grade}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {metrics.map((m) => (
              <div key={m.label} className="flex flex-col gap-0.5">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {m.label}
                </span>
                <span className="font-mono text-xl font-semibold tabular-nums">{m.value}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              {config.language} · {config.difficulty} · {config.duration}s
            </Badge>
            {result.finalWpm >= 100 && (
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 border">
                🏆 100+ WPM
              </Badge>
            )}
            {result.accuracy >= 98 && (
              <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 border">
                🎯 Akurasi Tinggi
              </Badge>
            )}
            {gainedXp !== null && gainedXp > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
              >
                <Badge className="bg-primary/10 text-primary border-primary/20 border">
                  ⚡ +{gainedXp} XP
                </Badge>
              </motion.div>
            )}
          </div>

          {user && gainedXp === null && (
            <p className="text-xs text-muted-foreground">Menyimpan hasil...</p>
          )}
          {!user && (
            <p className="text-xs text-muted-foreground">
              💡 Login untuk menyimpan hasil dan mendapatkan XP.
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <Button onClick={onRetry}>Coba Lagi</Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
