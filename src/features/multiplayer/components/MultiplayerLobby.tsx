"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useRealMultiplayerStore, useInitializeSocket } from "../store/realMultiplayerStore";
import { cn } from "@/lib/utils";
import type { RoomLanguage, RoomDifficulty } from "../types/multiplayer.types";
import { useAuthStore } from "@/features/auth/store/authStore";

// ── Helper Components ──────────────────────────────────────────

function PlayerCard({ player, isCurrentPlayer }: { player: any; isCurrentPlayer: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border border-border bg-card p-3",
        isCurrentPlayer && "border-primary bg-accent/50"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-medium">{player.username}</span>
          {player.isBot && <Badge variant="secondary" className="text-xs">Bot</Badge>}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold">{player.wpm} WPM</span>
          {player.isFinished && player.finishRank && (
            <Badge variant={player.finishRank === 1 ? "default" : "outline"}>
              #{player.finishRank}
            </Badge>
          )}
        </div>
      </div>
      <Progress value={player.progress} className="h-2" />
    </div>
  );
}

// ── Option Button ──────────────────────────────────────────────

function OptionButton({
  label,
  selected,
  onClick,
  description,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  description?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-start justify-center gap-0.5 rounded-xl border px-3 py-2 text-sm font-medium transition-all duration-150",
        selected
          ? "border-primary bg-primary/10 text-foreground"
          : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
      )}
    >
      <span className="text-xs font-semibold leading-tight">{label}</span>
      {description && <span className="text-[10px] text-muted-foreground leading-tight">{description}</span>}
    </button>
  );
}

// ── Room Settings Defaults ─────────────────────────────────────

// ── Room Settings Data ─────────────────────────────────────────

const DURATION_OPTIONS = [
  { label: "30 detik", value: 30 },
  { label: "1 menit", value: 60 },
  { label: "2 menit", value: 120 },
  { label: "3 menit", value: 180 },
  { label: "5 menit", value: 300 },
];

const DIFFICULTY_OPTIONS: { label: string; description: string; value: RoomDifficulty }[] = [
  { label: "Mudah", description: "Kata umum, pendek", value: "easy" },
  { label: "Sedang", description: "Campuran kosa kata", value: "medium" },
  { label: "Sulit", description: "Kata kompleks", value: "hard" },
  { label: "Expert", description: "Teks panjang & rumit", value: "expert" },
];

const LANGUAGE_OPTIONS: { group: string; items: { label: string; description: string; value: RoomLanguage }[] }[] = [
  {
    group: "Bahasa Alami",
    items: [
      { label: "Indonesia", description: "Bahasa Indonesia", value: "indonesia" },
      { label: "English", description: "English text", value: "english" },
      { label: "Japanese", description: "日本語", value: "japanese" },
      { label: "Korean", description: "한국어", value: "korean" },
      { label: "Spanish", description: "Español", value: "spanish" },
      { label: "French", description: "Français", value: "french" },
      { label: "German", description: "Deutsch", value: "german" },
      { label: "Portuguese", description: "Português", value: "portuguese" },
      { label: "Arabic", description: "العربية", value: "arabic" },
      { label: "Chinese", description: "中文", value: "chinese" },
      { label: "Russian", description: "Русский", value: "russian" },
      { label: "Italian", description: "Italiano", value: "italian" },
      { label: "Dutch", description: "Nederlands", value: "dutch" },
      { label: "Polish", description: "Polski", value: "polish" },
      { label: "Turkish", description: "Türkçe", value: "turkish" },
      { label: "Vietnamese", description: "Tiếng Việt", value: "vietnamese" },
      { label: "Thai", description: "ภาษาไทย", value: "thai" },
      { label: "Hindi", description: "हिन्दी", value: "hindi" },
    ],
  },
  {
    group: "Kode Program",
    items: [
      { label: "JavaScript", description: "JS / TypeScript", value: "code_javascript" },
      { label: "Python", description: "Python 3.x", value: "code_python" },
      { label: "Java", description: "Java / Kotlin", value: "code_java" },
      { label: "C / C++", description: "C-style syntax", value: "code_cpp" },
      { label: "SQL", description: "Database queries", value: "code_sql" },
    ],
  },
  {
    group: "Teks Spesial",
    items: [
      { label: "Kutipan", description: "Quotes terkenal", value: "quotes" },
      { label: "Novel", description: "Cuplikan novel", value: "novel" },
      { label: "Artikel", description: "Teks berita/artikel", value: "article" },
      { label: "Pangram", description: "Semua huruf alfabet", value: "pangram" },
      { label: "Angka", description: "Latihan angka", value: "numbers" },
      { label: "Kata Acak", description: "Random words", value: "random_words" },
    ],
  },
];

// Flat list for summary display
const ALL_LANGUAGE_ITEMS = LANGUAGE_OPTIONS.flatMap((g) => g.items);

const MAX_PLAYER_OPTIONS = [2, 3, 4, 5, 6, 8];

// ── Main Component ─────────────────────────────────────────────

export function MultiplayerLobby() {
  const socketHook = useInitializeSocket();

  const room = useRealMultiplayerStore((s) => s.room);
  const currentPlayer = useRealMultiplayerStore((s) => s.currentPlayer);
  const cursorIndex = useRealMultiplayerStore((s) => s.cursorIndex);
  const typedChars = useRealMultiplayerStore((s) => s.typedChars);
  const isConnected = useRealMultiplayerStore((s) => s.isConnected);
  const error = useRealMultiplayerStore((s) => s.error);
  const createRoom = useRealMultiplayerStore((s) => s.createRoom);
  const joinRoom = useRealMultiplayerStore((s) => s.joinRoom);
  const leaveRoom = useRealMultiplayerStore((s) => s.leaveRoom);
  const playerReady = useRealMultiplayerStore((s) => s.playerReady);
  const addBot = useRealMultiplayerStore((s) => s.addBot);
  const typeChar = useRealMultiplayerStore((s) => s.typeChar);
  const backspace = useRealMultiplayerStore((s) => s.backspace);

  // ── Room Settings State
  const [duration, setDuration] = useState(60);
  const [difficulty, setDifficulty] = useState<RoomDifficulty>("medium");
  const [language, setLanguage] = useState<RoomLanguage>("indonesia");
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [showCreateSettings, setShowCreateSettings] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [showJoin, setShowJoin] = useState(false);

  // Get actual username from auth store
  const authUser = useAuthStore((s) => s.user);
  const playerName = authUser?.username || "Player";

  useEffect(() => {
    if (room?.status !== "racing") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === "Backspace") {
        e.preventDefault();
        backspace();
        return;
      }

      if (e.key.length === 1 && room.targetText[cursorIndex]) {
        e.preventDefault();
        const expected = room.targetText[cursorIndex];
        if (expected) typeChar(e.key, expected);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [room?.status, room?.targetText, cursorIndex, typeChar, backspace]);

  // ── No Room: Lobby / Create ────────────────────────────────────
  if (!room) {
    return (
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Mode Multiplayer</p>
                <p className="text-xl font-semibold">Balapan mengetik real-time</p>
              </div>
              <div className="flex items-center gap-2">
                <div className={cn("h-2 w-2 rounded-full", isConnected ? "bg-green-500" : "bg-red-500")} />
                <span className="text-sm text-muted-foreground">
                  {isConnected ? "Terhubung" : "Terputus"}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                size="lg"
                disabled={!isConnected}
                onClick={() => setShowCreateSettings((v) => !v)}
              >
                Buat Room
              </Button>
              <Button
                size="lg"
                variant="outline"
                disabled={!isConnected}
                onClick={() => { setShowJoin((v) => !v); setShowCreateSettings(false); }}
              >
                Gabung Room
              </Button>
            </div>

            {/* Join Room Input */}
            {showJoin && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Masukkan kode room..."
                  maxLength={12}
                  className="flex-1 rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm font-mono outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && joinCode.trim()) joinRoom(joinCode.trim(), playerName);
                  }}
                />
                <Button
                  onClick={() => { if (joinCode.trim()) joinRoom(joinCode.trim(), playerName); }}
                  disabled={!joinCode.trim()}
                >
                  Gabung
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Room Settings Panel */}
        {showCreateSettings && (
          <Card className="border-primary/30">
            <CardHeader>
              <p className="font-semibold">Pengaturan Room</p>
              <p className="text-sm text-muted-foreground">Sesuaikan mode balapan sebelum membuat room</p>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">

              {/* Duration */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Durasi Waktu</label>
                <div className="flex flex-wrap gap-2">
                  {DURATION_OPTIONS.map((opt) => (
                    <OptionButton
                      key={opt.value}
                      label={opt.label}
                      selected={duration === opt.value}
                      onClick={() => setDuration(opt.value)}
                    />
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Tingkat Kesulitan</label>
                <div className="flex flex-wrap gap-2">
                  {DIFFICULTY_OPTIONS.map((opt) => (
                    <OptionButton
                      key={opt.value}
                      label={opt.label}
                      description={opt.description}
                      selected={difficulty === opt.value}
                      onClick={() => setDifficulty(opt.value)}
                    />
                  ))}
                </div>
              </div>

              {/* Language — grouped */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Bahasa / Teks</label>
                {LANGUAGE_OPTIONS.map((group) => (
                  <div key={group.group} className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{group.group}</p>
                    <div className="flex flex-wrap gap-2">
                      {group.items.map((opt) => (
                        <OptionButton
                          key={opt.value}
                          label={opt.label}
                          description={opt.description}
                          selected={language === opt.value}
                          onClick={() => setLanguage(opt.value)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Max Players */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Jumlah Pemain Maks</label>
                <div className="flex flex-wrap gap-2">
                  {MAX_PLAYER_OPTIONS.map((n) => (
                    <OptionButton
                      key={n}
                      label={`${n} pemain`}
                      selected={maxPlayers === n}
                      onClick={() => setMaxPlayers(n)}
                    />
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm">
                <p className="font-medium mb-1.5">Ringkasan Room</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground text-xs">
                  <span>Durasi: {DURATION_OPTIONS.find((d) => d.value === duration)?.label}</span>
                  <span>Kesulitan: {DIFFICULTY_OPTIONS.find((d) => d.value === difficulty)?.label}</span>
                  <span>Bahasa: {ALL_LANGUAGE_ITEMS.find((l) => l.value === language)?.label}</span>
                  <span>Maks Pemain: {maxPlayers}</span>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full"
                disabled={!isConnected}
                onClick={() =>
                  createRoom(playerName, {
                    durationSeconds: duration,
                    difficulty,
                    language,
                    maxPlayers,
                  })
                }
              >
                Buat Room Sekarang
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // ── Waiting Room ───────────────────────────────────────────────
  if (room.status === "waiting") {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Kode Room</p>
            <p className="font-mono text-2xl font-bold tracking-widest">{room.code}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant="outline">Menunggu</Badge>
            {room.settings && (
              <div className="flex gap-1.5 text-xs text-muted-foreground flex-wrap justify-end">
                <span>{DURATION_OPTIONS.find((d) => d.value === room.settings!.durationSeconds)?.label ?? `${room.settings.durationSeconds}d`}</span>
                <span>·</span>
                <span>{DIFFICULTY_OPTIONS.find((d) => d.value === room.settings!.difficulty)?.label}</span>
                <span>·</span>
                <span>{LANGUAGE_OPTIONS.find((l) => l.value === room.settings!.language)?.label}</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div>
            <p className="mb-2 text-sm font-medium">Pemain ({room.players.length}/{room.maxPlayers})</p>
            <div className="space-y-2">
              {room.players.map((p) => (
                <div key={p.id} className="flex items-center gap-2 rounded-lg border border-border bg-card p-3">
                  <span className="font-medium">{p.username}</span>
                  {p.isBot && <Badge variant="secondary" className="text-xs">Bot</Badge>}
                  {p.isReady && <Badge variant="outline" className="ml-auto text-xs text-green-500 border-green-500">Siap</Badge>}
                </div>
              ))}
              {Array.from({ length: Math.max(0, room.maxPlayers - room.players.length) }).map((_, i) => (
                <div key={`empty-${i}`} className="flex items-center gap-2 rounded-lg border border-dashed border-border/40 p-3 opacity-40">
                  <span className="text-sm text-muted-foreground">Menunggu pemain...</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={playerReady} disabled={!isConnected}>Siap</Button>
            <Button variant="outline" onClick={leaveRoom}>Keluar</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ── Countdown ──────────────────────────────────────────────────
  if (room.status === "countdown") {
    return (
      <Card>
        <CardContent className="flex h-64 flex-col items-center justify-center gap-4">
          <p className="text-sm text-muted-foreground">Race dimulai dalam</p>
          <p className="font-mono text-8xl font-bold text-primary">{room.countdown}</p>
        </CardContent>
      </Card>
    );
  }

  // ── Racing / Finished ──────────────────────────────────────────
  if (room.status === "racing" || room.status === "finished") {
    return (
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <p className="font-medium">Pemain</p>
              {room.status === "finished" && (
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 border">
                  Race Selesai
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {room.players
              .sort((a, b) => (b.progress || 0) - (a.progress || 0))
              .map((p) => (
                <PlayerCard key={p.id} player={p} isCurrentPlayer={p.id === currentPlayer?.id} />
              ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <p className="text-sm text-muted-foreground">Teks Target</p>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border bg-card p-4 font-mono text-lg leading-relaxed">
              {room.targetText.split("").map((char, i) => {
                const typed = typedChars[i];
                const isCurrent = i === cursorIndex;
                return (
                  <span
                    key={i}
                    className={cn(
                      "relative",
                      typed?.status === "correct" && "text-emerald-500",
                      typed?.status === "incorrect" && "text-destructive underline decoration-2 underline-offset-4",
                      !typed && !isCurrent && "text-foreground/40",
                      isCurrent && "underline decoration-2 underline-offset-2"
                    )}
                  >
                    {char}
                  </span>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {room.status === "finished" && (
          <div className="flex gap-3">
            <Button onClick={() => createRoom()}>Race Lagi</Button>
            <Button variant="outline" onClick={leaveRoom}>Keluar</Button>
          </div>
        )}
      </div>
    );
  }

  return null;
}
