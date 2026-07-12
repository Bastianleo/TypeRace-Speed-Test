"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTypingStore } from "../store/typingStore";
import type { Difficulty, TestDuration, TextLanguage } from "../types/typing.types";

const DURATIONS: { label: string; value: TestDuration }[] = [
  { label: "30s", value: 30 },
  { label: "60s", value: 60 },
  { label: "120s", value: 120 },
  { label: "300s", value: 300 },
];

const DIFFICULTIES: { label: string; value: Difficulty }[] = [
  { label: "Easy", value: "easy" },
  { label: "Medium", value: "medium" },
  { label: "Hard", value: "hard" },
  { label: "Expert", value: "expert" },
];

const LANGUAGES: { label: string; value: TextLanguage }[] = [
  { label: "Indonesia", value: "indonesia" },
  { label: "English", value: "english" },
  { label: "Programming", value: "programming" },
  { label: "Quotes", value: "quotes" },
  { label: "Custom", value: "custom" },
];

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "text-foreground underline decoration-2 underline-offset-4"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

export function SettingsBar() {
  const config = useTypingStore((s) => s.config);
  const setDuration = useTypingStore((s) => s.setDuration);
  const setDifficulty = useTypingStore((s) => s.setDifficulty);
  const setLanguage = useTypingStore((s) => s.setLanguage);
  const setCustomText = useTypingStore((s) => s.setCustomText);
  const resetTest = useTypingStore((s) => s.resetTest);
  const phase = useTypingStore((s) => s.phase);

  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customInput, setCustomInput] = useState("");

  const disabled = phase === "running";

  function handleCustomApply() {
    if (customInput.trim().length < 10) return;
    setCustomText(customInput.trim());
    setShowCustomInput(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        className={cn(
          "flex flex-wrap items-center gap-1 p-1.5",
          disabled && "pointer-events-none opacity-50"
        )}
      >
        <div className="flex flex-wrap gap-1 border-r border-border pr-2">
          {DURATIONS.map((d) => (
            <Pill
              key={d.value}
              active={config.duration === d.value}
              onClick={() => setDuration(d.value)}
            >
              {d.label}
            </Pill>
          ))}
        </div>
        <div className="flex flex-wrap gap-1 border-r border-border px-2">
          {DIFFICULTIES.map((d) => (
            <Pill
              key={d.value}
              active={config.difficulty === d.value}
              onClick={() => setDifficulty(d.value)}
            >
              {d.label}
            </Pill>
          ))}
        </div>
        <div className="flex flex-wrap gap-1 pl-2">
          {LANGUAGES.map((l) => (
            <Pill
              key={l.value}
              active={config.language === l.value}
              onClick={() => {
                setLanguage(l.value);
                if (l.value === "custom") setShowCustomInput(true);
                else setShowCustomInput(false);
              }}
            >
              {l.label}
            </Pill>
          ))}
        </div>

        {phase !== "idle" && (
          <div className="ml-auto pl-2">
            <Button
              size="sm"
              variant="ghost"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={resetTest}
            >
              Reset
            </Button>
          </div>
        )}
      </div>

      {showCustomInput && config.language === "custom" && !disabled && (
        <div className="flex gap-2">
          <textarea
            className="flex-1 resize-none rounded-lg border border-border bg-card p-3 font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            rows={3}
            placeholder="Masukkan teks kustom Anda di sini (minimal 10 karakter)…"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
          />
          <div className="flex flex-col gap-2">
            <Button size="sm" onClick={handleCustomApply} disabled={customInput.trim().length < 10}>
              Terapkan
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setShowCustomInput(false);
                setLanguage("english");
              }}
            >
              Batal
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
