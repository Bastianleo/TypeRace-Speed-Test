import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketOptions {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onRoomCreated?: (data: { roomId: string; playerId: string }) => void;
  onRoomJoined?: (data: { roomId: string; playerId: string }) => void;
  onRoomUpdate?: (roomData: any) => void;
  onCountdownStart?: (data: { count: number }) => void;
  onCountdownTick?: (data: { count: number }) => void;
  onRaceStart?: (data: { targetText: string; startTime: number }) => void;
  onError?: (error: { message: string }) => void;
}

// Singleton socket - created once per browser session
let _socket: Socket | null = null;

function getOrCreateSocket(): Socket {
  if (typeof window === 'undefined') {
    // Return a no-op mock during SSR
    throw new Error('Socket is not available on the server');
  }
  if (!_socket || !_socket.connected && _socket.disconnected) {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';
    _socket = io(socketUrl, { autoConnect: true, reconnection: true });
  }
  return _socket;
}

export function useSocket(options: UseSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  // Keep options in a ref so callbacks never cause re-subscription
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    // Only runs client-side
    let socket: Socket;
    try {
      socket = getOrCreateSocket();
    } catch {
      return;
    }
    socketRef.current = socket;

    // Sync initial state
    if (socket.connected) {
      setIsConnected(true);
      optionsRef.current.onConnect?.();
    }

    const handleConnect = () => {
      setIsConnected(true);
      optionsRef.current.onConnect?.();
    };
    const handleDisconnect = () => {
      setIsConnected(false);
      optionsRef.current.onDisconnect?.();
    };
    const handleRoomCreated = (data: { roomId: string; playerId: string }) =>
      optionsRef.current.onRoomCreated?.(data);
    const handleRoomJoined = (data: { roomId: string; playerId: string }) =>
      optionsRef.current.onRoomJoined?.(data);
    const handleRoomUpdate = (data: any) =>
      optionsRef.current.onRoomUpdate?.(data);
    const handleCountdownStart = (data: { count: number }) =>
      optionsRef.current.onCountdownStart?.(data);
    const handleCountdownTick = (data: { count: number }) =>
      optionsRef.current.onCountdownTick?.(data);
    const handleRaceStart = (data: { targetText: string; startTime: number }) =>
      optionsRef.current.onRaceStart?.(data);
    const handleError = (error: { message: string }) =>
      optionsRef.current.onError?.(error);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('room_created', handleRoomCreated);
    socket.on('room_joined', handleRoomJoined);
    socket.on('room_update', handleRoomUpdate);
    socket.on('countdown_start', handleCountdownStart);
    socket.on('countdown_tick', handleCountdownTick);
    socket.on('race_start', handleRaceStart);
    socket.on('error', handleError);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('room_created', handleRoomCreated);
      socket.off('room_joined', handleRoomJoined);
      socket.off('room_update', handleRoomUpdate);
      socket.off('countdown_start', handleCountdownStart);
      socket.off('countdown_tick', handleCountdownTick);
      socket.off('race_start', handleRaceStart);
      socket.off('error', handleError);
    };
  }, []); // Only subscribe once

  const emit = useCallback((event: string, data?: any) => {
    const s = socketRef.current;
    if (!s) {
      console.warn('[useSocket] Socket not initialized, cannot emit:', event);
      return;
    }
    s.emit(event, data);
  }, []);

  const createRoom = useCallback(
    (
      username: string,
      settings?: { durationSeconds: number; difficulty: string; language: string; maxPlayers: number }
    ) => {
      emit('create_room', {
        username,
        playerId: `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        settings: settings ?? {},
      });
    },
    [emit]
  );

  const joinRoom = useCallback(
    (roomId: string, username: string) => {
      emit('join_room', {
        roomId,
        username,
        playerId: `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      });
    },
    [emit]
  );

  const leaveRoom = useCallback(() => emit('leave_room'), [emit]);
  const playerReady = useCallback(() => emit('player_ready'), [emit]);
  const addBot = useCallback(() => emit('add_bot'), [emit]);
  const sendTypingProgress = useCallback(
    (progress: {
      progress: number;
      wpm: number;
      accuracy: number;
      typedChars: number;
      correctChars: number;
    }) => emit('typing_progress', progress),
    [emit]
  );

  return {
    socket: socketRef.current,
    isConnected,
    createRoom,
    joinRoom,
    leaveRoom,
    playerReady,
    addBot,
    sendTypingProgress,
  };
}