"use client";

import { useEffect, useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTypingStore } from "../store/typingStore";

/**
 * Grafik WPM live. Menggunakan recharts dengan styling minimal (tanpa grid
 * berisik, tanpa warna mencolok) agar konsisten dengan arahan desain corporate.
 */
export function LiveGraph() {
  const [history, setHistory] = useState(useTypingStore.getState().wpmHistory);

  useEffect(() => {
    return useTypingStore.subscribe((state) => setHistory(state.wpmHistory));
  }, []);

  if (history.length < 2) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-border bg-card text-sm text-muted-foreground shadow-subtle">
        Grafik WPM akan muncul setelah beberapa detik mengetik
      </div>
    );
  }

  return (
    <div className="h-40 rounded-xl border border-border bg-card p-4 shadow-subtle">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={history} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="secondsElapsed"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--popover))",
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="wpm"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
