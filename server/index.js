const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://your-domain.com'] 
      : ['http://localhost:3000'],
    methods: ['GET', 'POST']
  }
});

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
let supabase = null;

if (supabaseUrl && supabaseServiceKey && supabaseUrl !== 'your_supabase_url' && supabaseUrl !== '') {
  try {
    supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('Supabase client initialized successfully');
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
  }
} else {
  console.warn('Supabase credentials missing or default. DB persistence is disabled.');
}


app.use(cors());
app.use(express.json());

// In-memory room storage (production should use Redis)
const rooms = new Map();

// Room helper functions
function createRoom(settings = {}) {
  const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
  const room = {
    id: roomId,
    status: 'waiting', // waiting | countdown | racing | finished
    players: new Map(),
    maxPlayers: settings.maxPlayers || 4,
    durationSeconds: settings.durationSeconds || 60,
    difficulty: settings.difficulty || 'medium',
    language: settings.language || 'indonesia',
    targetText: "The quick brown fox jumps over the lazy dog. Practice makes perfect in typing speed tests.",
    createdAt: Date.now(),
    countdownTimer: null,
    raceStartTime: null
  };
  rooms.set(roomId, room);
  return room;
}

function getRoom(roomId) {
  return rooms.get(roomId);
}

function addPlayerToRoom(roomId, playerId, playerData) {
  const room = rooms.get(roomId);
  if (!room || room.players.size >= room.maxPlayers) return false;
  
  room.players.set(playerId, {
    id: playerId,
    socketId: playerData.socketId,
    username: playerData.username,
    progress: 0,
    wpm: 0,
    accuracy: 100,
    isReady: false,
    isFinished: false,
    finishRank: null,
    typedChars: 0,
    correctChars: 0
  });
  
  return true;
}

function removePlayerFromRoom(roomId, playerId) {
  const room = rooms.get(roomId);
  if (!room) return false;
  
  room.players.delete(playerId);
  
  // Clean up empty rooms
  if (room.players.size === 0) {
    if (room.countdownTimer) {
      clearInterval(room.countdownTimer);
    }
    rooms.delete(roomId);
  } else {
    // If the room was racing, check if the remaining players are all finished
    if (room.status === 'racing') {
      const allFinished = Array.from(room.players.values()).every(p => p.isFinished);
      if (allFinished) {
        room.status = 'finished';
        saveRaceResults(room);
      }
    }
  }
  
  return true;
}


function startCountdown(room) {
  if (room.status !== 'waiting') return;
  
  room.status = 'countdown';
  let count = 3;
  
  // Broadcast countdown start
  room.players.forEach(player => {
    if (player.socketId) {
      io.to(player.socketId).emit('countdown_start', { count });
    }
  });
  
  room.countdownTimer = setInterval(() => {
    count--;
    
    if (count > 0) {
      // Continue countdown
      room.players.forEach(player => {
        if (player.socketId) {
          io.to(player.socketId).emit('countdown_tick', { count });
        }
      });
    } else {
      // Start race
      clearInterval(room.countdownTimer);
      room.status = 'racing';
      room.raceStartTime = Date.now();
      
      room.players.forEach(player => {
        if (player.socketId) {
          io.to(player.socketId).emit('race_start', {
            targetText: room.targetText,
            startTime: room.raceStartTime
          });
        }
      });
      
      // Start bot ticker if there are bots
      startBotTicker(room);
    }
  }, 1000);
}

function startBotTicker(room) {
  const hasBots = Array.from(room.players.values()).some(p => p.isBot);
  if (!hasBots) return;
  
  const botTimer = setInterval(() => {
    if (room.status !== 'racing') {
      clearInterval(botTimer);
      return;
    }
    
    let stateChanged = false;
    const elapsedMinutes = (Date.now() - room.raceStartTime) / 60000;
    
    room.players.forEach((player) => {
      if (player.isBot && !player.isFinished) {
        if (!player.targetWpm) {
          player.targetWpm = 45 + Math.floor(Math.random() * 35); // 45-80 WPM
        }
        
        const targetChars = player.targetWpm * 5 * elapsedMinutes;
        const totalChars = room.targetText.length;
        const newProgress = Math.min(100, (targetChars / totalChars) * 100);
        
        player.progress = Math.round(newProgress * 10) / 10;
        player.wpm = Math.round(player.targetWpm);
        player.accuracy = 96 + Math.floor(Math.random() * 4); // 96-100%
        
        if (newProgress >= 100 && !player.isFinished) {
          player.isFinished = true;
          const finishedPlayers = Array.from(room.players.values()).filter(p => p.isFinished);
          player.finishRank = finishedPlayers.length;
        }
        
        stateChanged = true;
      }
    });
    
    if (stateChanged) {
      // Check if all players finished
      const allFinished = Array.from(room.players.values()).every(p => p.isFinished);
      if (allFinished) {
        room.status = 'finished';
        clearInterval(botTimer);
        saveRaceResults(room);
      }
      
      broadcastRoomState(room);
    }
  }, 1000);
}


function broadcastRoomState(room) {
  const roomData = {
    id: room.id,
    status: room.status,
    players: Array.from(room.players.values()),
    targetText: room.targetText,
    maxPlayers: room.maxPlayers
  };
  
  room.players.forEach(player => {
    if (player.socketId) {
      io.to(player.socketId).emit('room_update', roomData);
    }
  });
}


// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  let currentRoomId = null;
  let currentPlayerId = null;

  // Create room
  socket.on('create_room', (data) => {
    const settings = {
      maxPlayers: data.settings?.maxPlayers || 4,
      durationSeconds: data.settings?.durationSeconds || 60,
      difficulty: data.settings?.difficulty || 'medium',
      language: data.settings?.language || 'indonesia',
    };
    const room = createRoom(settings);
    const playerId = data.playerId || socket.id;
    
    const success = addPlayerToRoom(room.id, playerId, {
      socketId: socket.id,
      username: data.username || 'Player'
    });
    
    if (success) {
      currentRoomId = room.id;
      currentPlayerId = playerId;
      socket.join(room.id);
      
      socket.emit('room_created', {
        roomId: room.id,
        playerId: playerId
      });
      
      broadcastRoomState(room);
    } else {
      socket.emit('error', { message: 'Failed to create room' });
    }
  });

  // Join room
  socket.on('join_room', (data) => {
    const room = getRoom(data.roomId);
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }
    
    if (room.status !== 'waiting') {
      socket.emit('error', { message: 'Room is not accepting new players' });
      return;
    }
    
    const playerId = data.playerId || socket.id;
    const success = addPlayerToRoom(room.id, playerId, {
      socketId: socket.id,
      username: data.username || 'Player'
    });
    
    if (success) {
      currentRoomId = room.id;
      currentPlayerId = playerId;
      socket.join(room.id);
      
      socket.emit('room_joined', {
        roomId: room.id,
        playerId: playerId
      });
      
      broadcastRoomState(room);
    } else {
      socket.emit('error', { message: 'Room is full' });
    }
  });

  // Add Bot
  socket.on('add_bot', () => {
    if (!currentRoomId) return;
    const room = getRoom(currentRoomId);
    if (!room || room.status !== 'waiting' || room.players.size >= room.maxPlayers) return;
    
    const botId = `bot_${Math.random().toString(36).substring(2, 9)}`;
    const botNames = ['speedbot_alpha', 'type_machine', 'fast_fingers', 'keystroke_pro'];
    const botName = botNames[room.players.size % botNames.length] + `_${Math.floor(Math.random() * 100)}`;
    
    room.players.set(botId, {
      id: botId,
      socketId: null,
      username: botName,
      progress: 0,
      wpm: 0,
      accuracy: 100,
      isReady: true,
      isFinished: false,
      finishRank: null,
      isBot: true
    });
    
    // Check if all players (including bots) are ready
    const allReady = Array.from(room.players.values()).every(p => p.isReady);
    if (allReady && room.players.size >= 2) {
      startCountdown(room);
    }
    
    broadcastRoomState(room);
  });


  // Player ready
  socket.on('player_ready', () => {
    if (!currentRoomId || !currentPlayerId) return;
    
    const room = getRoom(currentRoomId);
    if (!room) return;
    
    const player = room.players.get(currentPlayerId);
    if (player) {
      player.isReady = true;
      
      // Check if all players are ready
      const allReady = Array.from(room.players.values()).every(p => p.isReady);
      
      if (allReady && room.players.size >= 2) {
        startCountdown(room);
      }
      
      broadcastRoomState(room);
    }
  });

  // Typing progress
  socket.on('typing_progress', (data) => {
    if (!currentRoomId || !currentPlayerId) return;
    
    const room = getRoom(currentRoomId);
    if (!room || room.status !== 'racing') return;
    
    const player = room.players.get(currentPlayerId);
    if (!player || player.isFinished) return;
    
    // Update player stats
    player.progress = data.progress;
    player.wpm = data.wpm;
    player.accuracy = data.accuracy;
    player.typedChars = data.typedChars;
    player.correctChars = data.correctChars;
    
    // Check if player finished
    if (data.progress >= 100 && !player.isFinished) {
      player.isFinished = true;
      
      // Calculate finish rank
      const finishedPlayers = Array.from(room.players.values()).filter(p => p.isFinished);
      player.finishRank = finishedPlayers.length;
      
      // Check if all players finished
      const allFinished = Array.from(room.players.values()).every(p => p.isFinished);
      if (allFinished) {
        room.status = 'finished';
        
        // Save results to Supabase
        saveRaceResults(room);
      }
    }
    
    broadcastRoomState(room);
  });

  // Leave room
  socket.on('leave_room', () => {
    if (currentRoomId && currentPlayerId) {
      const room = getRoom(currentRoomId);
      if (room) {
        removePlayerFromRoom(currentRoomId, currentPlayerId);
        socket.leave(currentRoomId);
        
        if (room.players.size > 0) {
          broadcastRoomState(room);
        }
      }
    }
    
    currentRoomId = null;
    currentPlayerId = null;
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    if (currentRoomId && currentPlayerId) {
      const room = getRoom(currentRoomId);
      if (room) {
        removePlayerFromRoom(currentRoomId, currentPlayerId);
        
        if (room.players.size > 0) {
          broadcastRoomState(room);
        }
      }
    }
  });
});

// Save race results to Supabase
async function saveRaceResults(room) {
  if (!supabase) {
    console.log('Supabase client not initialized, skipping saving results.');
    return;
  }
  try {
    const players = Array.from(room.players.values());
    
    for (const player of players) {
      if (player.isBot) continue;
      
      try {
        await supabase
          .from('TypingResult')
          .insert({
            userId: player.id,
            mode: 'multiplayer',
            durationSeconds: Math.round((Date.now() - room.raceStartTime) / 1000),
            language: 'ENGLISH',
            difficulty: 'MEDIUM',
            wpm: player.wpm,
            rawWpm: Math.round(player.typedChars / 5 / ((Date.now() - room.raceStartTime) / 60000)) || player.wpm,
            accuracy: player.accuracy,
            consistency: 85,
            correctChars: player.correctChars || 0,
            incorrectChars: (player.typedChars - player.correctChars) || 0,
            errors: (player.typedChars - player.correctChars) || 0,
            grade: calculateGrade(player.wpm, player.accuracy)
          });
      } catch (err) {
        console.error(`Failed to save results for player ${player.username}:`, err.message);
      }
    }
    
    console.log('Race results saved to Supabase');
  } catch (error) {
    console.error('Error saving race results:', error);
  }
}


function calculateGrade(wpm, accuracy) {
  const score = wpm * (accuracy / 100);
  if (score >= 90 && accuracy >= 97) return 'S';
  if (score >= 70 && accuracy >= 92) return 'A';
  if (score >= 50 && accuracy >= 85) return 'B';
  if (score >= 30) return 'C';
  return 'D';
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    rooms: rooms.size,
    uptime: process.uptime()
  });
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});