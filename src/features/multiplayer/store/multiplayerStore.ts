import { create } from "zustand";
import type { Room, Player, RoomStatus } from "../types/multiplayer.types";

interface MultiplayerState {
  room: Room | null;
  currentPlayer: Player | null;
  typedChars: number;
  cursorIndex: number;
  startedAt: number | null;

  createRoom: () => void;
  joinRoom: (roomCode: string) => void;
  leaveRoom: () => void;
  startCountdown: () => void;
  typeChar: (char: string, expected: string) => void;
  backspace: () => void;
  tickBot: () => void;
}

const BOT_NAMES = [
  { username: "speedbot_alpha", country: "🤖" },
  { username: "type_machine", country: "🤖" },
  { username: "fast_fingers", country: "🤖" },
  { username: "keystroke_pro", country: "🤖" },
];

function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generateBots(count: number): Player[] {
  return BOT_NAMES.slice(0, count).map((bot, i) => ({
    id: `bot-${i}`,
    username: bot.username,
    country: bot.country,
    progress: 0,
    wpm: 0,
    accuracy: 100,
    isFinished: false,
    isBot: true,
  }));
}

export const useMultiplayerStore = create<MultiplayerState>((set, get) => ({
  room: null,
  currentPlayer: null,
  typedChars: 0,
  cursorIndex: 0,
  startedAt: null,

  createRoom: () => {
    const player: Player = {
      id: "player-1",
      username: "Anda",
      country: "🇮🇩",
      progress: 0,
      wpm: 0,
      accuracy: 100,
      isFinished: false,
    };

    const bots = generateBots(3);

    const room: Room = {
      id: Math.random().toString(36),
      code: generateRoomCode(),
      status: "waiting",
      players: [player, ...bots],
      maxPlayers: 4,
      targetText:
        "The quick brown fox jumps over the lazy dog. Practice makes perfect. Speed and accuracy are both important in typing.",
    };

    set({ room, currentPlayer: player, cursorIndex: 0, typedChars: 0 });
  },

  joinRoom: (roomCode: string) => {
    // Simulasi join room dengan bot
    get().createRoom();
  },

  leaveRoom: () => {
    set({ room: null, currentPlayer: null, cursorIndex: 0, typedChars: 0, startedAt: null });
  },

  startCountdown: () => {
    const { room } = get();
    if (!room || room.status !== "waiting") return;

    set({ room: { ...room, status: "countdown", countdown: 3 } });

    let count = 3;
    const interval = setInterval(() => {
      const currentRoom = get().room;
      if (!currentRoom) {
        clearInterval(interval);
        return;
      }

      count--;
      if (count > 0) {
        set({ room: { ...currentRoom, countdown: count } });
      } else {
        clearInterval(interval);
        set({
          room: { ...currentRoom, status: "racing", countdown: undefined },
          startedAt: Date.now(),
        });
      }
    }, 1000);
  },

  typeChar: (char: string, expected: string) => {
    const { room, currentPlayer, cursorIndex, startedAt, typedChars } = get();
    if (!room || !currentPlayer || room.status !== "racing") return;

    const isCorrect = char === expected;
    const newCursorIndex = cursorIndex + 1;
    const newTypedChars = typedChars + 1;
    const progress = Math.min(100, (newCursorIndex / room.targetText.length) * 100);

    const elapsedSeconds = startedAt ? Math.max(1, (Date.now() - startedAt) / 1000) : 1;
    const wpm = Math.round((newCursorIndex / 5) / (elapsedSeconds / 60));

    const updatedPlayers = room.players.map((p) =>
      p.id === currentPlayer.id
        ? { ...p, progress, wpm, accuracy: Math.max(85, 100 - (newTypedChars - newCursorIndex) * 2) }
        : p
    );

    set({
      cursorIndex: newCursorIndex,
      typedChars: newTypedChars,
      currentPlayer: { ...currentPlayer, progress, wpm },
      room: { ...room, players: updatedPlayers },
    });

    if (newCursorIndex >= room.targetText.length) {
      const finishedCount = updatedPlayers.filter((p) => p.isFinished).length;
      const updatedWithFinish = updatedPlayers.map((p) =>
        p.id === currentPlayer.id ? { ...p, isFinished: true, finishRank: finishedCount + 1 } : p
      );
      set({ room: { ...room, players: updatedWithFinish } });

      if (updatedWithFinish.every((p) => p.isFinished)) {
        set({ room: { ...room, status: "finished", players: updatedWithFinish } });
      }
    }
  },

  backspace: () => {
    const { cursorIndex } = get();
    if (cursorIndex === 0) return;
    set({ cursorIndex: cursorIndex - 1 });
  },

  tickBot: () => {
    const { room, startedAt } = get();
    if (!room || room.status !== "racing" || !startedAt) return;

    const updatedPlayers = room.players.map((p) => {
      if (!p.isBot || p.isFinished) return p;

      const botSpeed = 0.5 + Math.random() * 0.8;
      const newProgress = Math.min(100, p.progress + botSpeed);
      const elapsedSeconds = Math.max(1, (Date.now() - startedAt) / 1000);
      const charsTyped = (newProgress / 100) * room.targetText.length;
      const wpm = Math.round((charsTyped / 5) / (elapsedSeconds / 60));

      if (newProgress >= 100) {
        const finishedCount = room.players.filter((pl) => pl.isFinished).length;
        return { ...p, progress: 100, wpm, isFinished: true, finishRank: finishedCount + 1 };
      }

      return { ...p, progress: newProgress, wpm };
    });

    set({ room: { ...room, players: updatedPlayers } });

    if (updatedPlayers.every((p) => p.isFinished)) {
      set({ room: { ...room, status: "finished", players: updatedPlayers } });
    }
  },
}));
