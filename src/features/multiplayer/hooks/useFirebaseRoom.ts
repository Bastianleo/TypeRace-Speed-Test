import { useEffect, useRef, useState, useCallback } from 'react';
import { db } from '@/lib/firebase';
import {
  ref as dbRef,
  set as dbSet,
  get as dbGet,
  update as dbUpdate,
  remove as dbRemove,
  onValue,
  onDisconnect,
} from 'firebase/database';

interface UseFirebaseRoomOptions {
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

const ROOMS_PATH = 'rooms';

const WORD_LISTS: Record<string, string> = {
  indonesia: "Kucing oranye itu meloncat dengan lincah di atas atap rumah yang hangat. Latihan yang teratur akan membentuk memori otot pada jari-jari Anda, yang merupakan kunci utama untuk mengetik lebih cepat dan akurat tanpa harus melihat tombol keyboard.",
  english: "The quick brown fox jumps over the lazy dog. Practice makes perfect in typing speed tests. Consistent training builds muscle memory, which is the key to typing faster and with fewer mistakes on any keyboard layout.",
  japanese: "The quick brown fox jumps over the lazy dog. Practice makes perfect in typing speed tests.",
};

export function useFirebaseRoom(options: UseFirebaseRoomOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null);

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const activeRoomIdRef = useRef<string | null>(null);
  activeRoomIdRef.current = activeRoomId;

  const activePlayerIdRef = useRef<string | null>(null);
  activePlayerIdRef.current = activePlayerId;

  const botIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Monitor Firebase Connection Status
  useEffect(() => {
    if (!db) return;
    const connectedRef = dbRef(db, '.info/connected');
    const unsubscribe = onValue(connectedRef, (snap) => {
      const connected = snap.val() === true;
      setIsConnected(connected);
      if (connected) {
        optionsRef.current.onConnect?.();
      } else {
        optionsRef.current.onDisconnect?.();
      }
    });
    return () => unsubscribe();
  }, []);

  // Monitor Room Changes
  useEffect(() => {
    if (!db || !activeRoomId || !activePlayerId) return;

    const roomRef = dbRef(db, `${ROOMS_PATH}/${activeRoomId}`);
    const playerRef = dbRef(db, `${ROOMS_PATH}/${activeRoomId}/players/${activePlayerId}`);

    // Setup Disconnect handler
    onDisconnect(playerRef).remove();

    const unsubscribe = onValue(roomRef, (snapshot) => {
      const roomVal = snapshot.val();
      if (!roomVal) {
        // Room was deleted
        setActiveRoomId(null);
        setActivePlayerId(null);
        return;
      }

      // Convert players dictionary to array for compatibility
      const playersDict = roomVal.players || {};
      const playersList = Object.keys(playersDict).map((key) => playersDict[key]);

      const formattedRoomData = {
        id: roomVal.id,
        status: roomVal.status,
        players: playersList,
        targetText: roomVal.targetText,
        maxPlayers: roomVal.maxPlayers,
        countdown: roomVal.countdown,
      };

      optionsRef.current.onRoomUpdate?.(formattedRoomData);

      // --- Host specific coordination logic ---
      const nonBotPlayers = Object.keys(playersDict)
        .filter((id) => !playersDict[id].isBot)
        .sort();
      const isHost = nonBotPlayers[0] === activePlayerId;

      if (isHost) {
        // 1. Check if countdown needs to start
        const allReady = Object.keys(playersDict).length >= 2 && 
                         Object.keys(playersDict).every((id) => playersDict[id].isReady);
        
        if (roomVal.status === 'waiting' && allReady && !countdownIntervalRef.current) {
          // Trigger countdown
          let currentCount = 3;
          dbUpdate(roomRef, { status: 'countdown', countdown: currentCount });
          optionsRef.current.onCountdownStart?.({ count: currentCount });

          countdownIntervalRef.current = setInterval(async () => {
            currentCount--;
            if (currentCount > 0) {
              dbUpdate(roomRef, { countdown: currentCount });
              optionsRef.current.onCountdownTick?.({ count: currentCount });
            } else {
              if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
                countdownIntervalRef.current = null;
              }
              const startTime = Date.now();
              await dbUpdate(roomRef, {
                status: 'racing',
                countdown: null,
                raceStartTime: startTime,
              });
              optionsRef.current.onRaceStart?.({
                targetText: roomVal.targetText,
                startTime,
              });
            }
          }, 1000);
        }

        // 2. Simulating Bots progress
        if (roomVal.status === 'racing' && !botIntervalRef.current) {
          botIntervalRef.current = setInterval(() => {
            dbGet(roomRef).then((snap) => {
              const currentRoom = snap.val();
              if (!currentRoom || currentRoom.status !== 'racing') {
                if (botIntervalRef.current) {
                  clearInterval(botIntervalRef.current);
                  botIntervalRef.current = null;
                }
                return;
              }

              const elapsedMinutes = (Date.now() - currentRoom.raceStartTime) / 60000;
              const currentPlayersDict = currentRoom.players || {};
              const targetTextLength = currentRoom.targetText.length;
              let hasUpdates = false;
              const updates: Record<string, any> = {};

              Object.keys(currentPlayersDict).forEach((id) => {
                const p = currentPlayersDict[id];
                if (p.isBot && !p.isFinished) {
                  if (!p.targetWpm) {
                    p.targetWpm = 45 + Math.floor(Math.random() * 35); // 45-80 WPM
                  }

                  const targetChars = p.targetWpm * 5 * elapsedMinutes;
                  const newProgress = Math.min(100, (targetChars / targetTextLength) * 100);
                  const isFinished = newProgress >= 100;

                  updates[`players/${id}/progress`] = Math.round(newProgress * 10) / 10;
                  updates[`players/${id}/wpm`] = Math.round(p.targetWpm);
                  updates[`players/${id}/accuracy`] = 96 + Math.floor(Math.random() * 4);

                  if (isFinished) {
                    updates[`players/${id}/isFinished`] = true;
                    const finishedCount = Object.keys(currentPlayersDict).filter(
                      (pid) => currentPlayersDict[pid].isFinished || pid === id
                    ).length;
                    updates[`players/${id}/finishRank`] = finishedCount;
                  }
                  hasUpdates = true;
                }
              });

              if (hasUpdates) {
                dbUpdate(roomRef, updates).then(() => {
                  dbGet(roomRef).then((freshSnap) => {
                    const freshRoom = freshSnap.val();
                    if (freshRoom) {
                      const freshPlayers = freshRoom.players || {};
                      const allFinished = Object.keys(freshPlayers).every(
                        (pid) => freshPlayers[pid].isFinished
                      );
                      if (allFinished) {
                        dbUpdate(roomRef, { status: 'finished' });
                        if (botIntervalRef.current) {
                          clearInterval(botIntervalRef.current);
                          botIntervalRef.current = null;
                        }
                      }
                    }
                  });
                });
              }
            });
          }, 1000);
        }
      }

      // Cleanup timers when race ends
      if (roomVal.status === 'finished' || roomVal.status === 'waiting') {
        if (botIntervalRef.current) {
          clearInterval(botIntervalRef.current);
          botIntervalRef.current = null;
        }
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
      }
    });

    return () => {
      unsubscribe();
      if (botIntervalRef.current) {
        clearInterval(botIntervalRef.current);
        botIntervalRef.current = null;
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, [activeRoomId, activePlayerId]);

  const createRoom = useCallback(
    async (
      username: string,
      settings?: { durationSeconds: number; difficulty: string; language: string; maxPlayers: number }
    ) => {
      if (!db) {
        optionsRef.current.onError?.({ message: 'Firebase database tidak terhubung.' });
        return;
      }

      const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
      const playerId = `player_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const language = settings?.language || 'indonesia';
      const targetText = WORD_LISTS[language] || WORD_LISTS.english;

      const initialRoom = {
        id: roomId,
        code: roomId,
        status: 'waiting',
        maxPlayers: settings?.maxPlayers || 4,
        durationSeconds: settings?.durationSeconds || 60,
        difficulty: settings?.difficulty || 'medium',
        language,
        targetText,
        createdAt: Date.now(),
        players: {
          [playerId]: {
            id: playerId,
            username,
            progress: 0,
            wpm: 0,
            accuracy: 100,
            isReady: false,
            isFinished: false,
            finishRank: null,
            isBot: false,
          },
        },
      };

      try {
        await dbSet(dbRef(db, `${ROOMS_PATH}/${roomId}`), initialRoom);
        setActiveRoomId(roomId);
        setActivePlayerId(playerId);
        optionsRef.current.onRoomCreated?.({ roomId, playerId });
        optionsRef.current.onRoomJoined?.({ roomId, playerId });
      } catch (err: any) {
        optionsRef.current.onError?.({ message: err.message || 'Gagal membuat room.' });
      }
    },
    []
  );

  const joinRoom = useCallback(async (roomId: string, username: string) => {
    if (!db) {
      optionsRef.current.onError?.({ message: 'Firebase database tidak terhubung.' });
      return;
    }

    const cleanRoomId = roomId.toUpperCase().trim();
    const roomRef = dbRef(db, `${ROOMS_PATH}/${cleanRoomId}`);

    try {
      const snap = await dbGet(roomRef);
      const room = snap.val();

      if (!room) {
        optionsRef.current.onError?.({ message: 'Room tidak ditemukan.' });
        return;
      }

      if (room.status !== 'waiting') {
        optionsRef.current.onError?.({ message: 'Room sedang tidak menerima pemain baru.' });
        return;
      }

      const currentPlayers = room.players || {};
      if (Object.keys(currentPlayers).length >= room.maxPlayers) {
        optionsRef.current.onError?.({ message: 'Room sudah penuh.' });
        return;
      }

      const playerId = `player_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const newPlayer = {
        id: playerId,
        username,
        progress: 0,
        wpm: 0,
        accuracy: 100,
        isReady: false,
        isFinished: false,
        finishRank: null,
        isBot: false,
      };

      await dbSet(dbRef(db, `${ROOMS_PATH}/${cleanRoomId}/players/${playerId}`), newPlayer);
      setActiveRoomId(cleanRoomId);
      setActivePlayerId(playerId);
      optionsRef.current.onRoomJoined?.({ roomId: cleanRoomId, playerId });
    } catch (err: any) {
      optionsRef.current.onError?.({ message: err.message || 'Gagal masuk ke room.' });
    }
  }, []);

  const leaveRoom = useCallback(async () => {
    const roomId = activeRoomIdRef.current;
    const playerId = activePlayerIdRef.current;

    if (!db || !roomId || !playerId) return;

    try {
      const playerRef = dbRef(db, `${ROOMS_PATH}/${roomId}/players/${playerId}`);
      await dbRemove(playerRef);

      // Check if room is empty
      const roomPlayersRef = dbRef(db, `${ROOMS_PATH}/${roomId}/players`);
      const snap = await dbGet(roomPlayersRef);
      if (!snap.exists() || Object.keys(snap.val() || {}).length === 0) {
        await dbRemove(dbRef(db, `${ROOMS_PATH}/${roomId}`));
      }

      setActiveRoomId(null);
      setActivePlayerId(null);
    } catch (err) {
      console.error('Error saat meninggalkan room:', err);
    }
  }, []);

  const playerReady = useCallback(async () => {
    const roomId = activeRoomIdRef.current;
    const playerId = activePlayerIdRef.current;

    if (!db || !roomId || !playerId) return;

    try {
      const playerReadyRef = dbRef(db, `${ROOMS_PATH}/${roomId}/players/${playerId}/isReady`);
      await dbSet(playerReadyRef, true);
    } catch (err) {
      console.error('Gagal menyetel ready:', err);
    }
  }, []);

  const addBot = useCallback(async () => {
    const roomId = activeRoomIdRef.current;
    if (!db || !roomId) return;

    try {
      const roomRef = dbRef(db, `${ROOMS_PATH}/${roomId}`);
      const snap = await dbGet(roomRef);
      const room = snap.val();

      if (!room || Object.keys(room.players || {}).length >= room.maxPlayers) return;

      const botId = `bot_${Math.random().toString(36).substring(2, 9)}`;
      const botNames = ['speedbot_alpha', 'type_machine', 'fast_fingers', 'keystroke_pro'];
      const botName = botNames[Object.keys(room.players || {}).length % botNames.length] + `_${Math.floor(Math.random() * 100)}`;

      const newBot = {
        id: botId,
        username: botName,
        progress: 0,
        wpm: 0,
        accuracy: 100,
        isReady: true,
        isFinished: false,
        finishRank: null,
        isBot: true,
      };

      await dbSet(dbRef(db, `${ROOMS_PATH}/${roomId}/players/${botId}`), newBot);
    } catch (err) {
      console.error('Gagal menambahkan bot:', err);
    }
  }, []);

  const sendTypingProgress = useCallback(
    async (progressData: {
      progress: number;
      wpm: number;
      accuracy: number;
      typedChars: number;
      correctChars: number;
    }) => {
      const roomId = activeRoomIdRef.current;
      const playerId = activePlayerIdRef.current;

      if (!db || !roomId || !playerId) return;

      try {
        const playerRef = dbRef(db, `${ROOMS_PATH}/${roomId}/players/${playerId}`);
        const progress = Math.round(progressData.progress * 10) / 10;
        const isFinished = progress >= 100;

        const updates: Record<string, any> = {
          progress,
          wpm: progressData.wpm,
          accuracy: progressData.accuracy,
        };

        if (isFinished) {
          updates.isFinished = true;

          const roomPlayersRef = dbRef(db, `${ROOMS_PATH}/${roomId}/players`);
          const snap = await dbGet(roomPlayersRef);
          const playersDict = snap.val() || {};

          const finishedCount = Object.keys(playersDict).filter(
            (pid) => playersDict[pid].isFinished && pid !== playerId
          ).length;

          updates.finishRank = finishedCount + 1;
        }

        await dbUpdate(playerRef, updates);

        if (isFinished) {
          const roomRef = dbRef(db, `${ROOMS_PATH}/${roomId}`);
          const roomSnap = await dbGet(roomRef);
          const room = roomSnap.val();
          if (room) {
            const allFinished = Object.keys(room.players || {}).every(
              (pid) => room.players[pid].isFinished || pid === playerId
            );
            if (allFinished) {
              await dbUpdate(roomRef, { status: 'finished' });
            }
          }
        }
      } catch (err) {
        console.error('Gagal memperbarui progress mengetik:', err);
      }
    },
    []
  );

  return {
    socket: null,
    isConnected,
    createRoom,
    joinRoom,
    leaveRoom,
    playerReady,
    addBot,
    sendTypingProgress,
  };
}
