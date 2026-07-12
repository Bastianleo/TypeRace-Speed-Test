"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTypingStore } from "../store/typingStore";

/**
 * Render teks target dengan status per-karakter:
 * - correct: hijau emerald
 * - incorrect: merah dengan underline
 * - current: kursor berkedip
 * - pending: abu-abu muted
 */
export function TypingArea() {
  const targetText = useTypingStore((s) => s.targetText);
  const typedChars = useTypingStore((s) => s.typedChars);
  const cursorIndex = useTypingStore((s) => s.cursorIndex);
  const phase = useTypingStore((s) => s.phase);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const activeEl = containerRef.current.querySelector('[data-current="true"]');
    activeEl?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [cursorIndex]);

  const displayText =
    targetText ||
    "Pilih durasi & bahasa lalu mulai mengetik untuk memulai tes\u2026";

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative max-h-40 overflow-hidden rounded-xl border border-border bg-card p-6 font-mono text-xl leading-relaxed tracking-wide",
        phase === "idle" && "text-muted-foreground"
      )}
      aria-label="Area teks pengetikan"
      role="textbox"
      aria-readonly="true"
    >
      {phase === "idle" ? (
        <span>{displayText}</span>
      ) : (
        displayText.split("").map((char, index) => {
          const typed = typedChars[index];
          const isCurrent = index === cursorIndex;
          return (
            <span
              key={index}
              data-current={isCurrent}
              className={cn(
                "relative",
                typed?.status === "correct" && "text-emerald-500",
                typed?.status === "incorrect" &&
                  "text-destructive underline decoration-2 underline-offset-4",
                !typed && !isCurrent && "text-foreground/40"
              )}
            >
              {isCurrent && (
                <motion.span
                  layoutId="typing-cursor"
                  className="absolute -left-[1px] top-0 h-full w-[2px] bg-primary"
                  transition={{ duration: 0.12 }}
                />
              )}
              {char}
            </span>
          );
        })
      )}
    </div>
  );
}
