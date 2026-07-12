"use client";

import { AnimatePresence, motion } from "framer-motion";
import { SettingsBar } from "./SettingsBar";
import { TypingArea } from "./TypingArea";
import { StatsPanel } from "./StatsPanel";
import { ResultScreen } from "./ResultScreen";
import { useTypingInput } from "../hooks/useTypingInput";
import { useTestTimer } from "../hooks/useTestTimer";
import { useTypingStore } from "../store/typingStore";

/**
 * Komponen root untuk Solo Typing Mode. Menyusun seluruh sub-komponen dan
 * mengaktifkan side-effect hooks (input keyboard fisik + timer 1 detik).
 */
export function TypingTest() {
  const phase = useTypingStore((s) => s.phase);
  const resetTest = useTypingStore((s) => s.resetTest);

  useTypingInput();
  useTestTimer();

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <AnimatePresence mode="wait">
        {phase === "finished" ? (
          <ResultScreen key="result" onRetry={resetTest} />
        ) : (
          <motion.div
            key="test"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-6"
          >
            <SettingsBar />
            <StatsPanel />
            <TypingArea />
            {phase === "idle" && (
              <p className="text-center text-sm text-muted-foreground">
                Mulai ketik untuk memulai tes
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
