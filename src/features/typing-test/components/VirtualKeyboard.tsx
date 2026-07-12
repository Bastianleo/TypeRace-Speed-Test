"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useTypingStore } from "../store/typingStore";
import { KEYBOARD_ROWS, charToKeyCode } from "../utils/keyboardLayout";

/**
 * Keyboard virtual TKL. Highlight dua state:
 * - "next": tombol yang harus ditekan berikutnya (aksen primary, lebih tenang)
 * - "pressed": tombol yang sedang secara fisik ditekan (feedback sesaat)
 */
export function VirtualKeyboard() {
  const nextKeyCode = useTypingStore((s) => s.nextKeyCode);
  const [pressed, setPressed] = useState<Set<string>>(new Set());

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      setPressed((prev) => new Set(prev).add(e.code));
    };
    const onUp = (e: KeyboardEvent) => {
      setPressed((prev) => {
        const next = new Set(prev);
        next.delete(e.code);
        return next;
      });
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

  const nextCode = nextKeyCode ? charToKeyCode(nextKeyCode) : null;

  return (
    <div
      className="hidden select-none flex-col gap-1.5 rounded-xl border border-border bg-card p-4 shadow-subtle md:flex"
      aria-hidden="true"
    >
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1.5">
          {row.map((key) => {
            const isNext = key.code === nextCode;
            const isPressed = pressed.has(key.code);
            return (
              <div
                key={key.code}
                style={{ flexGrow: key.widthUnit ?? 1 }}
                className={cn(
                  "flex h-9 items-center justify-center rounded-md border border-border bg-secondary/50 text-xs font-medium text-muted-foreground transition-all duration-100",
                  isNext && "border-primary/40 bg-accent text-accent-foreground",
                  isPressed && "scale-95 border-primary bg-primary text-primary-foreground"
                )}
              >
                {key.label}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
