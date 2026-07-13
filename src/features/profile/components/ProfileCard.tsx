"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store/authStore";
import { cn } from "@/lib/utils";

const COUNTRIES = [
  { flag: "🌍", name: "Global" },
  { flag: "🇮🇩", name: "Indonesia" },
  { flag: "🇺🇸", name: "United States" },
  { flag: "🇬🇧", name: "United Kingdom" },
  { flag: "🇯🇵", name: "Japan" },
  { flag: "🇰🇷", name: "South Korea" },
  { flag: "🇨🇳", name: "China" },
  { flag: "🇩🇪", name: "Germany" },
  { flag: "🇫🇷", name: "France" },
  { flag: "🇧🇷", name: "Brazil" },
  { flag: "🇮🇳", name: "India" },
  { flag: "🇷🇺", name: "Russia" },
  { flag: "🇨🇦", name: "Canada" },
  { flag: "🇦🇺", name: "Australia" },
  { flag: "🇸🇬", name: "Singapore" },
  { flag: "🇲🇾", name: "Malaysia" },
  { flag: "🇵🇭", name: "Philippines" },
  { flag: "🇹🇭", name: "Thailand" },
  { flag: "🇻🇳", name: "Vietnam" },
  { flag: "🇳🇱", name: "Netherlands" },
  { flag: "🇪🇸", name: "Spain" },
  { flag: "🇮🇹", name: "Italy" },
  { flag: "🇵🇱", name: "Poland" },
  { flag: "🇸🇪", name: "Sweden" },
  { flag: "🇳🇴", name: "Norway" },
  { flag: "🇩🇰", name: "Denmark" },
  { flag: "🇵🇹", name: "Portugal" },
  { flag: "🇹🇷", name: "Turkey" },
  { flag: "🇸🇦", name: "Saudi Arabia" },
  { flag: "🇦🇪", name: "UAE" },
  { flag: "🇿🇦", name: "South Africa" },
  { flag: "🇳🇬", name: "Nigeria" },
  { flag: "🇪🇬", name: "Egypt" },
  { flag: "🇲🇽", name: "Mexico" },
  { flag: "🇦🇷", name: "Argentina" },
];

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
  const { user, logout, checkSession, setUser } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editCountry, setEditCountry] = useState("");
  const [editError, setEditError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowCountryDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const startEdit = () => {
    setEditDisplayName(user?.displayName || user?.username || "");
    setEditCountry(user?.country || "🌍");
    setEditError("");
    setSaveSuccess(false);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditError("");
    setCountrySearch("");
  };

  const handleSave = async () => {
    if (!editDisplayName.trim()) {
      setEditError("Nama tampilan tidak boleh kosong.");
      return;
    }
    if (editDisplayName.trim().length > 32) {
      setEditError("Nama tampilan maksimal 32 karakter.");
      return;
    }
    setEditError("");
    setIsSaving(true);
    try {
      const res = await fetch("/api/profile/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: editDisplayName.trim(),
          country: editCountry,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setSaveSuccess(true);
        setIsEditing(false);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setEditError(data.error || "Gagal menyimpan.");
      }
    } catch {
      setEditError("Terjadi kesalahan koneksi.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.flag.includes(countrySearch)
  );

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
        <CardHeader className="flex flex-row items-start gap-4">
          {/* Avatar */}
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border border-border text-2xl font-bold bg-primary/10 text-primary uppercase">
            {user ? user.username.substring(0, 2) : "?"}
          </div>

          <div className="flex flex-1 flex-col gap-2">
            {isEditing ? (
              /* ── Edit Mode ── */
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-muted-foreground">Nama Tampilan</label>
                  <input
                    type="text"
                    value={editDisplayName}
                    onChange={(e) => setEditDisplayName(e.target.value)}
                    maxLength={32}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 w-full max-w-xs"
                    placeholder="Nama tampilan..."
                    autoFocus
                  />
                  <span className="text-[10px] text-muted-foreground">{editDisplayName.length}/32 karakter</span>
                </div>

                {/* Country picker */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-muted-foreground">Negara / Bendera</label>
                  <div className="relative max-w-xs" ref={dropdownRef}>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm transition hover:border-primary/50"
                      onClick={() => setShowCountryDropdown((v) => !v)}
                    >
                      <span className="text-xl">{editCountry}</span>
                      <span className="text-muted-foreground">
                        {COUNTRIES.find((c) => c.flag === editCountry)?.name ?? "Pilih negara"}
                      </span>
                      <span className="ml-auto text-muted-foreground text-xs">▾</span>
                    </button>
                    {showCountryDropdown && (
                      <div className="absolute z-50 mt-1 w-full max-h-56 overflow-y-auto rounded-xl border border-border bg-popover shadow-lg">
                        <div className="sticky top-0 bg-popover p-2 border-b border-border">
                          <input
                            type="text"
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                            placeholder="Cari negara..."
                            className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs outline-none focus:border-primary"
                            autoFocus
                          />
                        </div>
                        {filteredCountries.map((c) => (
                          <button
                            key={c.flag}
                            type="button"
                            className={cn(
                              "flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors",
                              editCountry === c.flag && "bg-primary/10 text-primary font-medium"
                            )}
                            onClick={() => {
                              setEditCountry(c.flag);
                              setShowCountryDropdown(false);
                              setCountrySearch("");
                            }}
                          >
                            <span className="text-xl">{c.flag}</span>
                            <span>{c.name}</span>
                          </button>
                        ))}
                        {filteredCountries.length === 0 && (
                          <p className="p-3 text-center text-xs text-muted-foreground">Tidak ditemukan</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {editError && (
                  <p className="text-xs text-destructive">{editError}</p>
                )}

                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "Menyimpan..." : "Simpan"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={cancelEdit} disabled={isSaving}>
                    Batal
                  </Button>
                </div>
              </div>
            ) : (
              /* ── View Mode ── */
              <>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-lg">{user ? user.displayName || user.username : "Tamu"}</p>
                  {user?.country && (
                    <span className="text-xl" title={COUNTRIES.find((c) => c.flag === user.country)?.name}>{user.country}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={user ? "default" : "outline"} className="w-fit">
                    {user ? "Terverifikasi" : "Belum login"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">@{user?.username}</span>
                </div>
                {saveSuccess && (
                  <p className="text-xs text-green-500">✓ Profil berhasil diperbarui!</p>
                )}
              </>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          <p className="text-sm text-muted-foreground">
            {user
              ? `Kamu memiliki total ${user.xp ?? 0} XP dan level ${user.level ?? 1}.`
              : "Login untuk menyimpan statistik, naik level, dan masuk leaderboard global."}
          </p>

          {/* Stats grid */}
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

          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            {user ? (
              <>
                {!isEditing && (
                  <Button variant="outline" onClick={startEdit}>
                    ✏️ Edit Profil
                  </Button>
                )}
                <Button variant="destructive" onClick={handleLogout}>
                  Keluar / Logout
                </Button>
              </>
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
