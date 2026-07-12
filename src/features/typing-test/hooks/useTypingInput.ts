import { useCallback, useEffect } from "react";
import { useTypingStore } from "../store/typingStore";

interface UseTypingInputOptions {
  onKeyDown?: (code: string) => void;
  onKeyUp?: (code: string) => void;
  soundEnabled?: boolean;
  playKeySound?: () => void;
}

/**
 * Menangani input keyboard fisik untuk area pengetikan.
 * Sengaja memakai `keydown` (bukan input controlled) agar karakter seperti
 * Backspace, Tab, dan tombol khusus lain bisa ditangani secara eksplisit.
 */
export function useTypingInput({
  onKeyDown,
  onKeyUp,
  soundEnabled,
  playKeySound,
}: UseTypingInputOptions = {}) {
  const phase = useTypingStore((s) => s.phase);
  const typeChar = useTypingStore((s) => s.typeChar);
  const backspace = useTypingStore((s) => s.backspace);
  const startTest = useTypingStore((s) => s.startTest);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Abaikan kombinasi modifier (Ctrl/Cmd/Alt) agar shortcut browser tetap jalan
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (phase === "idle" && e.key.length === 1) {
        startTest();
      }

      if (e.key === "Backspace") {
        e.preventDefault();
        backspace();
        onKeyDown?.(e.code);
        return;
      }

      if (e.key.length === 1) {
        e.preventDefault();
        typeChar(e.key);
        if (soundEnabled) playKeySound?.();
        onKeyDown?.(e.code);
      }

      if (e.key === "Enter" && e.shiftKey === false) {
        // Enter tidak dipakai sebagai karakter valid pada mode default
      }
    },
    [phase, typeChar, backspace, startTest, onKeyDown, soundEnabled, playKeySound]
  );

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      onKeyUp?.(e.code);
    },
    [onKeyUp]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);
}
