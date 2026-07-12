import { useEffect } from "react";
import { useTypingStore } from "../store/typingStore";

/**
 * Menjalankan interval 1 detik selama phase === "running".
 * Dipisah dari store agar store tetap murni (tidak menyentuh side effects browser).
 */
export function useTestTimer() {
  const phase = useTypingStore((s) => s.phase);
  const tickSecond = useTypingStore((s) => s.tickSecond);

  useEffect(() => {
    if (phase !== "running") return;

    const interval = setInterval(() => {
      tickSecond();
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, tickSecond]);
}
