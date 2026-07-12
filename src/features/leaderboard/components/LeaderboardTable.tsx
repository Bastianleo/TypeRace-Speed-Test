"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Period = "alltime" | "weekly" | "monthly";
type Mode = "wpm" | "accuracy";

interface Entry {
  rank: number;
  username: string;
  country: string;
  wpm: number;
  accuracy: number;
  language: string;
}

const RANK_STYLE: Record<number, string> = {
  1: "text-amber-500 font-bold",
  2: "text-slate-400 font-bold",
  3: "text-orange-400 font-bold",
};

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

export function LeaderboardTable() {
  const [period, setPeriod] = useState<Period>("alltime");
  const [mode, setMode] = useState<Mode>("wpm");
  const [data, setData] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/leaderboard?period=${period}&mode=${mode}`);
      if (!res.ok) throw new Error("Gagal memuat data leaderboard");
      const json = await res.json();
      setData(json.leaderboard ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [period, mode]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Peringkat global pemain tercepat</p>
          <p className="text-xl font-semibold">Leaderboard</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-1 rounded-lg border border-border p-1">
            {(["alltime", "weekly", "monthly"] as Period[]).map((p) => (
              <Pill key={p} active={period === p} onClick={() => setPeriod(p)}>
                {p === "alltime" ? "All Time" : p === "weekly" ? "Mingguan" : "Bulanan"}
              </Pill>
            ))}
          </div>
          <div className="flex gap-1 rounded-lg border border-border p-1">
            <Pill active={mode === "wpm"} onClick={() => setMode("wpm")}>WPM</Pill>
            <Pill active={mode === "accuracy"} onClick={() => setMode("accuracy")}>Akurasi</Pill>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3 py-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-4 w-6 animate-pulse rounded bg-muted" />
                <div className="h-4 flex-1 animate-pulse rounded bg-muted" />
                <div className="h-4 w-12 animate-pulse rounded bg-muted" />
                <div className="h-4 w-12 animate-pulse rounded bg-muted" />
                <div className="h-4 w-16 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="py-8 text-center text-sm text-destructive">{error}</p>
        ) : data.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Belum ada data untuk periode ini. Jadilah yang pertama!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <th className="pb-3 pr-4">#</th>
                  <th className="pb-3 pr-4">Pemain</th>
                  <th className="pb-3 pr-4">WPM</th>
                  <th className="pb-3 pr-4">Akurasi</th>
                  <th className="pb-3">Bahasa</th>
                </tr>
              </thead>
              <tbody>
                {data.map((entry, i) => (
                  <tr
                    key={entry.username}
                    className="border-b border-border/50 transition-colors last:border-0 hover:opacity-80"
                  >
                    <td className={cn("py-3 pr-4 font-mono", RANK_STYLE[i + 1] ?? "text-muted-foreground")}>
                      {i + 1}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="mr-2">{entry.country}</span>
                      <span className="font-medium">{entry.username}</span>
                    </td>
                    <td className="py-3 pr-4 font-mono font-semibold tabular-nums">{entry.wpm}</td>
                    <td className="py-3 pr-4 font-mono tabular-nums">{entry.accuracy}%</td>
                    <td className="py-3">
                      <Badge variant="secondary">{entry.language}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
