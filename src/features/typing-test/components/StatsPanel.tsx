"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { useTypingStore, selectLiveStats } from "../store/typingStore";
import { formatSeconds } from "@/lib/utils";

function StatBlock({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="font-mono text-2xl font-semibold tabular-nums text-foreground">
        {value}
      </span>
    </div>
  );
}

/**
 * Panel statistik live. Di-refresh setiap tick (via subscribe manual) supaya
 * WPM saat ini terasa "hidup" tanpa perlu re-render seluruh store consumer lain.
 */
export function StatsPanel() {
  const [stats, setStats] = useState(() => selectLiveStats(useTypingStore.getState()));

  useEffect(() => {
    const unsub = useTypingStore.subscribe((state) => setStats(selectLiveStats(state)));
    const interval = setInterval(() => setStats(selectLiveStats(useTypingStore.getState())), 500);
    return () => {
      unsub();
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
      <StatBlock label="WPM" value={stats.currentWpm} />
      <StatBlock label="Akurasi" value={`${stats.accuracy}%`} />
      <StatBlock label="Waktu" value={formatSeconds(stats.remainingSeconds)} />
      <StatBlock label="Error" value={stats.errors} />
      <StatBlock label="Rata-rata WPM" value={stats.averageWpm} />
      <StatBlock label="WPM Tertinggi" value={stats.highestWpm} />
      <StatBlock label="Konsistensi" value={`${Math.round(stats.consistency)}%`} />
      <StatBlock label="Kata Diketik" value={stats.wordsTyped} />

      <div className="col-span-2 sm:col-span-4">
        <Progress value={stats.progressPercent} aria-label="Progres tes" />
      </div>
    </div>
  );
}
