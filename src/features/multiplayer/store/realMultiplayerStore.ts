import { useEffect } from "react";
import { create } from "zustand";
import { useFirebaseRoom } from "../hooks/useFirebaseRoom";
import type { Room, Player, RoomStatus } from "../types/multiplayer.types";

interface RealMultiplayerState {
  room: Room | null;
  currentPlayer: Player | null;
  playerId: string | null;
  isConnected: boolean;
  error: string | null;
  
  // Typing state
  typedChars: { char: string; status: "correct" | "incorrect" }[];
  cursorIndex: number;
  startedAt: number | null;
  
  // Socket integration
  socketHook: any | null;
  
  // Actions
  setRoom: (room: Room | null) => void;
  setCurrentPlayer: (player: Player | null) => void;
  setPlayerId: (id: string) => void;
  setConnected: (connected: boolean) => void;
  setError: (error: string | null) => void;
  setSocketHook: (socketHook: any) => void;
  
  // Room actions
  createRoom: (username?: string, settings?: { durationSeconds: number; difficulty: string; language: string; maxPlayers: number }) => void;
  joinRoom: (roomCode: string, username?: string) => void;
  leaveRoom: () => void;
  playerReady: () => void;
  addBot: () => void;

  
  // Typing actions
  typeChar: (char: string, expected: string) => Promise<void>;
  backspace: () => Promise<void>;
  resetTyping: () => void;
  
  // Race actions
  startRace: (targetText: string, startTime: number) => void;
}

// Create a singleton socket hook instance that will be shared
let globalSocketHook: any = null;

export const useRealMultiplayerStore = create<RealMultiplayerState>((set, get) => ({
  room: null,
  currentPlayer: null,
  playerId: null,
  isConnected: false,
  error: null,
  
  typedChars: [],
  cursorIndex: 0,
  startedAt: null,
  
  socketHook: null,
  
  setRoom: (room) => {
    set({ room });
    
    // Update current player if we're in the room
    const state = get();
    if (room && state.playerId) {
      const player = room.players.find(p => p.id === state.playerId);
      if (player) {
        set({ currentPlayer: player });
      }
    }
  },
  setCurrentPlayer: (player) => set({ currentPlayer: player }),
  setPlayerId: (id) => set({ playerId: id }),
  setConnected: (connected) => set({ isConnected: connected }),
  setError: (error) => set({ error }),
  setSocketHook: (socketHook) => {
    set({ socketHook });
    globalSocketHook = socketHook;
  },
  
  createRoom: (username = "Player", settings?) => {
    const { socketHook } = get();
    if (socketHook?.createRoom) {
      socketHook.createRoom(username, settings);
      set({ error: null });
    } else {
      set({ error: "Not connected to server" });
    }
  },
  
  joinRoom: (roomCode: string, username = "Player") => {
    const { socketHook } = get();
    if (socketHook?.joinRoom) {
      socketHook.joinRoom(roomCode, username);
      set({ error: null });
    } else {
      set({ error: "Not connected to server" });
    }
  },
  
  leaveRoom: () => {
    const { socketHook } = get();
    if (socketHook?.leaveRoom) {
      socketHook.leaveRoom();
    }
    // Reset local state
    set({ 
      room: null, 
      currentPlayer: null, 
      playerId: null,
      cursorIndex: 0,
      typedChars: [],
      startedAt: null,
      error: null 
    });
  },
  
  playerReady: () => {
    const { socketHook } = get();
    if (socketHook?.playerReady) {
      socketHook.playerReady();
    } else {
      set({ error: "Not connected to server" });
    }
  },
  
  addBot: () => {
    const { socketHook } = get();
    if (socketHook?.addBot) {
      socketHook.addBot();
    } else {
      set({ error: "Not connected to server" });
    }
  },

  
  typeChar: async (char, expected) => {
    const { room, cursorIndex, typedChars, startedAt, socketHook, playerId } = get();
    if (!room || !startedAt || room.status !== "racing") return;
    
    const isCorrect = char === expected;
    const newCursorIndex = cursorIndex + 1;
    const nextTypedChars = [...typedChars, { char, status: isCorrect ? "correct" as const : "incorrect" as const }];
    const totalTypedCount = nextTypedChars.length;
    
    // Calculate stats
    const correctChars = nextTypedChars.filter(c => c.status === "correct").length;
    const progress = Math.min(100, (correctChars / room.targetText.length) * 100);
    const elapsedMinutes = (Date.now() - startedAt) / 60000;
    const wpm = Math.round((correctChars / 5) / Math.max(elapsedMinutes, 0.01));
    const accuracy = Math.round((correctChars / totalTypedCount) * 100);
    
    // Update local state immediately for responsive UI
    set({
      cursorIndex: newCursorIndex,
      typedChars: nextTypedChars
    });
    
    // Send progress to server
    if (socketHook?.sendTypingProgress) {
      socketHook.sendTypingProgress({
        progress,
        wpm,
        accuracy,
        typedChars: totalTypedCount,
        correctChars
      });
    }
    
    // Update current player immediately for responsive UI
    const currentPlayer = get().currentPlayer;
    if (currentPlayer && playerId) {
      const updatedPlayer = { 
        ...currentPlayer, 
        progress, 
        wpm, 
        accuracy,
        isFinished: progress >= 100 
      };
      set({ currentPlayer: updatedPlayer });
    }
  },
  
  backspace: async () => {
    const { cursorIndex, room, startedAt, socketHook, typedChars, playerId } = get();
    if (cursorIndex === 0 || !room || room.status !== "racing" || !startedAt || typedChars.length === 0) return;
    
    const newCursorIndex = cursorIndex - 1;
    const nextTypedChars = typedChars.slice(0, -1);
    const totalTypedCount = nextTypedChars.length;
    
    set({ 
      cursorIndex: newCursorIndex,
      typedChars: nextTypedChars
    });
    
    // Recalculate and send updated progress
    const correctChars = nextTypedChars.filter(c => c.status === "correct").length;
    const progress = Math.min(100, (correctChars / room.targetText.length) * 100);
    const elapsedMinutes = (Date.now() - startedAt) / 60000;
    const wpm = Math.round((correctChars / 5) / Math.max(elapsedMinutes, 0.01));
    const accuracy = totalTypedCount > 0 ? Math.round((correctChars / totalTypedCount) * 100) : 100;
    
    // Send progress to server
    if (socketHook?.sendTypingProgress) {
      socketHook.sendTypingProgress({
        progress,
        wpm,
        accuracy,
        typedChars: totalTypedCount,
        correctChars
      });
    }
    
    // Update current player
    const currentPlayer = get().currentPlayer;
    if (currentPlayer && playerId) {
      const updatedPlayer = { 
        ...currentPlayer, 
        progress, 
        wpm, 
        accuracy,
        isFinished: false 
      };
      set({ currentPlayer: updatedPlayer });
    }
  },
  
  resetTyping: () => set({
    typedChars: [],
    cursorIndex: 0,
    startedAt: null
  }),
  
  startRace: (targetText, startTime) => {
    set({
      startedAt: startTime,
      cursorIndex: 0,
      typedChars: []
    });
  }
}));

// Hook to initialize socket integration
export function useInitializeSocket() {
  const setSocketHook = useRealMultiplayerStore(state => state.setSocketHook);
  const setConnected = useRealMultiplayerStore(state => state.setConnected);
  const setRoom = useRealMultiplayerStore(state => state.setRoom);
  const setPlayerId = useRealMultiplayerStore(state => state.setPlayerId);
  const setCurrentPlayer = useRealMultiplayerStore(state => state.setCurrentPlayer);
  const setError = useRealMultiplayerStore(state => state.setError);
  const startRace = useRealMultiplayerStore(state => state.startRace);
  
  const socketHook = useFirebaseRoom({
    onConnect: () => {
      console.log("Firebase connected");
      setConnected(true);
      setError(null);
    },
    onDisconnect: () => {
      console.log("Firebase disconnected");
      setConnected(false);
      setError("Disconnected from Firebase. Reconnecting...");
    },
    onRoomCreated: (data) => {
      console.log("Room created:", data);
      setPlayerId(data.playerId);
      setError(null);
    },
    onRoomJoined: (data) => {
      console.log("Room joined:", data);
      setPlayerId(data.playerId);
      setError(null);
    },
    onRoomUpdate: (roomData) => {
      console.log("Room update received:", roomData);
      // Convert server room data to client room format
      const room: Room = {
        id: roomData.id,
        code: roomData.id, // Server uses id as code
        status: roomData.status as RoomStatus,
        players: roomData.players.map((p: any) => ({
          id: p.id,
          username: p.username,
          country: p.country || "🌍", // Use provided country or default
          progress: p.progress || 0,
          wpm: p.wpm || 0,
          accuracy: p.accuracy || 100,
          isFinished: p.isFinished || false,
          finishRank: p.finishRank || undefined,
          isBot: p.isBot || false
        })),
        maxPlayers: roomData.maxPlayers || 4,
        targetText: roomData.targetText || "The quick brown fox jumps over the lazy dog.",
        countdown: roomData.countdown,
        settings: {
          durationSeconds: roomData.durationSeconds || 60,
          difficulty: roomData.difficulty || 'medium',
          language: roomData.language || 'indonesia',
          maxPlayers: roomData.maxPlayers || 4
        }
      };
      
      setRoom(room);
      setError(null);
    },
    onCountdownStart: (data) => {
      console.log("Countdown started:", data);
      const currentRoom = useRealMultiplayerStore.getState().room;
      if (currentRoom) {
        setRoom({
          ...currentRoom,
          status: "countdown",
          countdown: data.count
        });
      }
    },
    onCountdownTick: (data) => {
      console.log("Countdown tick:", data);
      const currentRoom = useRealMultiplayerStore.getState().room;
      if (currentRoom) {
        setRoom({
          ...currentRoom,
          countdown: data.count
        });
      }
    },
    onRaceStart: (data) => {
      console.log("Race started:", data);
      const currentRoom = useRealMultiplayerStore.getState().room;
      if (currentRoom) {
        const updatedRoom = {
          ...currentRoom,
          status: "racing" as RoomStatus,
          countdown: undefined,
          targetText: data.targetText
        };
        setRoom(updatedRoom);
        startRace(data.targetText, data.startTime);
      }
    },
    onError: (error) => {
      console.error("Socket error:", error);
      setError(error.message || "An unknown error occurred");
    }
  });
  
  // Set the socket hook in the store once on mount
  useEffect(() => {
    setSocketHook(socketHook);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep isConnected in sync separately
  useEffect(() => {
    setConnected(socketHook.isConnected);
  }, [socketHook.isConnected, setConnected]);

  return socketHook;
}

if (typeof window !== "undefined") {
  (window as any).multiplayerStore = useRealMultiplayerStore;
}