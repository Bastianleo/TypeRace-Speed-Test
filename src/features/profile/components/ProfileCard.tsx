"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store/authStore";

interface ProfileStats {
  completedTests: number;
  bestWpm: number;
  avgWpm: number;
  avgAccuracy: number;
  totalTimeMinutes: number;
  level: number;
  xp: number;
}

export function ProfileCard() {
  const { user, logout, checkSession } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (user) {
      setLoadingStats(true);
      fetch("/api/profile/stats")
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Gagal mengambil data");
        })
        .then((data) => {
          setStats(data.stats);
        })
        .catch((err) => {
          console.error(err);
        })
        .finally(() => {
          setLoadingStats(false);
        });
    } else {
      setStats(null);
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const statItems = [
    { label: "Tes Diselesaikan", value: stats?.completedTests ?? 0 },
    { label: "WPM Terbaik", value: stats?.bestWpm && stats.bestWpm > 0 ? stats.bestWpm : "—" },
    { label: "WPM Rata-rata", value: stats?.avgWpm && stats.avgWpm > 0 ? stats.avgWpm : "—" },
    { label: "Akurasi Rata-rata", value: stats?.avgAccuracy && stats.avgAccuracy > 0 ? `${stats.avgAccuracy}%` : "—" },
    { label: "Total Waktu Mengetik", value: stats ? `${stats.totalTimeMinutes}m` : "0m" },
    { label: "Level", value: stats?.level ?? user?.level ?? 1 },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border text-2xl font-bold bg-primary/10 text-primary uppercase">
            {user ? user.username.substring(0, 2) : "?"}
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-semibold text-lg">{user ? user.displayName || user.username : "Tamu"}</p>
            <div className="flex items-center gap-2">
              <Badge variant={user ? "default" : "outline"} className="w-fit">
                {user ? "Terverifikasi" : "Belum login"}
              </Badge>
              {user?.country && (
                <span className="text-sm font-medium" title={`Negara: ${user.country}`}>
                  {user.country}
                </span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <p className="text-sm text-muted-foreground">
            {user
              ? `Kamu memiliki total ${user.xp ?? 0} XP dan level ${user.level ?? 1}.`
              : "Login untuk menyimpan statistik, naik level, dan masuk leaderboard global."}
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {statItems.map((s) => (
              <div key={s.label} className="flex flex-col gap-0.5 rounded-lg border border-border p-3">
                <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
                <span className="font-mono text-xl font-semibold tabular-nums">
                  {loadingStats ? (
                    <span className="inline-block h-4 w-12 animate-pulse rounded bg-muted" />
                  ) : (
                    s.value
                  )}
                </span>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            {user ? (
              <Button variant="destructive" onClick={handleLogout}>
                Keluar / Logout
              </Button>
            ) : (
              <>
                <Button onClick={() => router.push("/login")}>Login / Daftar</Button>
                <Button variant="outline" disabled>Hubungkan Akun</Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
