import { act, renderHook } from '@testing-library/react';
import { useRealMultiplayerStore, useInitializeSocket } from './realMultiplayerStore';
import { useSocket } from '../hooks/useSocket';
import type { Room, Player } from '../types/multiplayer.types';

// Mock the useSocket hook
jest.mock('../hooks/useSocket');
const mockUseSocket = useSocket as jest.MockedFunction<typeof useSocket>;

describe('useRealMultiplayerStore', () => {
  let mockSocketHook: any;
  
  beforeEach(() => {
    // Reset store state
    useRealMultiplayerStore.setState({
      room: null,
      currentPlayer: null,
      playerId: null,
      isConnected: false,
      error: null,
      typedChars: 0,
      cursorIndex: 0,
      startedAt: null,
      socketHook: null
    });
    
    // Setup mock socket hook
    mockSocketHook = {
      socket: null,
      isConnected: false,
      createRoom: jest.fn(),
      joinRoom: jest.fn(),
      leaveRoom: jest.fn(),
      playerReady: jest.fn(),
      sendTypingProgress: jest.fn()
    };
    
    mockUseSocket.mockReturnValue(mockSocketHook);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useRealMultiplayerStore());
      
      expect(result.current.room).toBeNull();
      expect(result.current.currentPlayer).toBeNull();
      expect(result.current.playerId).toBeNull();
      expect(result.current.isConnected).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.typedChars).toBe(0);
      expect(result.current.cursorIndex).toBe(0);
      expect(result.current.startedAt).toBeNull();
    });
  });

  describe('Room Management', () => {
    it('should create room when socket is available', () => {
      const { result } = renderHook(() => useRealMultiplayerStore());
      
      act(() => {
        result.current.setSocketHook(mockSocketHook);
        result.current.createRoom('TestPlayer');
      });
      
      expect(mockSocketHook.createRoom).toHaveBeenCalledWith('TestPlayer');
      expect(result.current.error).toBeNull();
    });

    it('should set error when creating room without socket', () => {
      const { result } = renderHook(() => useRealMultiplayerStore());
      
      act(() => {
        result.current.createRoom('TestPlayer');
      });
      
      expect(result.current.error).toBe('Not connected to server');
    });

    it('should join room when socket is available', () => {
      const { result } = renderHook(() => useRealMultiplayerStore());
      
      act(() => {
        result.current.setSocketHook(mockSocketHook);
        result.current.joinRoom('TESTROOM', 'TestPlayer');
      });
      
      expect(mockSocketHook.joinRoom).toHaveBeenCalledWith('TESTROOM', 'TestPlayer');
      expect(result.current.error).toBeNull();
    });

    it('should reset state when leaving room', () => {
      const { result } = renderHook(() => useRealMultiplayerStore());
      
      // Set some initial state
      act(() => {
        result.current.setSocketHook(mockSocketHook);
        result.current.setRoom({
          id: 'test-room',
          code: 'TESTROOM',
          status: 'waiting',
          players: [],
          maxPlayers: 4,
          targetText: 'test text'
        });
        result.current.setPlayerId('player-1');
        result.current.leaveRoom();
      });
      
      expect(mockSocketHook.leaveRoom).toHaveBeenCalled();
      expect(result.current.room).toBeNull();
      expect(result.current.currentPlayer).toBeNull();
      expect(result.current.playerId).toBeNull();
      expect(result.current.cursorIndex).toBe(0);
      expect(result.current.typedChars).toBe(0);
      expect(result.current.startedAt).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });

  describe('Connection State Management', () => {
    it('should update connection state', () => {
      const { result } = renderHook(() => useRealMultiplayerStore());
      
      act(() => {
        result.current.setConnected(true);
      });
      
      expect(result.current.isConnected).toBe(true);
      
      act(() => {
        result.current.setConnected(false);
      });
      
      expect(result.current.isConnected).toBe(false);
    });

    it('should update error state', () => {
      const { result } = renderHook(() => useRealMultiplayerStore());
      
      act(() => {
        result.current.setError('Test error message');
      });
      
      expect(result.current.error).toBe('Test error message');
      
      act(() => {
        result.current.setError(null);
      });
      
      expect(result.current.error).toBeNull();
    });
  });

  describe('Typing Progress', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useRealMultiplayerStore());
      
      act(() => {
        result.current.setSocketHook(mockSocketHook);
        result.current.setRoom({
          id: 'test-room',
          code: 'TESTROOM',
          status: 'racing',
          players: [],
          maxPlayers: 4,
          targetText: 'hello world'
        });
        result.current.startRace('hello world', Date.now());
        result.current.setPlayerId('player-1');
        result.current.setCurrentPlayer({
          id: 'player-1',
          username: 'TestPlayer',
          country: '🇺🇸',
          progress: 0,
          wpm: 0,
          accuracy: 100,
          isFinished: false
        });
      });
    });

    it('should handle correct character input', async () => {
      const { result } = renderHook(() => useRealMultiplayerStore());
      
      await act(async () => {
        await result.current.typeChar('h', 'h');
      });
      
      expect(result.current.cursorIndex).toBe(1);
      expect(result.current.typedChars).toBe(1);
      expect(mockSocketHook.sendTypingProgress).toHaveBeenCalled();
    });

    it('should handle backspace correctly', async () => {
      const { result } = renderHook(() => useRealMultiplayerStore());
      
      // First type a character
      await act(async () => {
        await result.current.typeChar('h', 'h');
      });
      
      // Then backspace
      await act(async () => {
        await result.current.backspace();
      });
      
      expect(result.current.cursorIndex).toBe(0);
      expect(mockSocketHook.sendTypingProgress).toHaveBeenCalledTimes(2);
    });

    it('should not backspace when at start', async () => {
      const { result } = renderHook(() => useRealMultiplayerStore());
      
      await act(async () => {
        await result.current.backspace();
      });
      
      expect(result.current.cursorIndex).toBe(0);
    });

    it('should not type when race is not active', async () => {
      const { result } = renderHook(() => useRealMultiplayerStore());
      
      act(() => {
        result.current.setRoom({
          id: 'test-room',
          code: 'TESTROOM',
          status: 'waiting',
          players: [],
          maxPlayers: 4,
          targetText: 'hello world'
        });
      });

      await act(async () => {
        await result.current.typeChar('h', 'h');
      });
      
      expect(result.current.cursorIndex).toBe(0);
      expect(result.current.typedChars).toBe(0);
    });
  });

  describe('Player Ready', () => {
    it('should call playerReady when socket is available', () => {
      const { result } = renderHook(() => useRealMultiplayerStore());
      
      act(() => {
        result.current.setSocketHook(mockSocketHook);
        result.current.playerReady();
      });
      
      expect(mockSocketHook.playerReady).toHaveBeenCalled();
    });

    it('should set error when calling playerReady without socket', () => {
      const { result } = renderHook(() => useRealMultiplayerStore());
      
      act(() => {
        result.current.playerReady();
      });
      
      expect(result.current.error).toBe('Not connected to server');
    });
  });

  describe('Room Updates', () => {
    it('should update current player when room changes', () => {
      const { result } = renderHook(() => useRealMultiplayerStore());
      
      const testPlayer: Player = {
        id: 'player-1',
        username: 'TestPlayer',
        country: '🇺🇸',
        progress: 25,
        wpm: 45,
        accuracy: 95,
        isFinished: false
      };

      const testRoom: Room = {
        id: 'test-room',
        code: 'TESTROOM',
        status: 'racing',
        players: [testPlayer],
        maxPlayers: 4,
        targetText: 'hello world'
      };
      
      act(() => {
        result.current.setPlayerId('player-1');
        result.current.setRoom(testRoom);
      });
      
      expect(result.current.currentPlayer).toEqual(testPlayer);
    });
  });
});

describe('useInitializeSocket', () => {
  beforeEach(() => {
    // Reset store state
    useRealMultiplayerStore.setState({
      room: null,
      currentPlayer: null,
      playerId: null,
      isConnected: false,
      error: null,
      typedChars: 0,
      cursorIndex: 0,
      startedAt: null,
      socketHook: null
    });
  });

  it('should initialize socket hook and set it in store', () => {
    const mockSocketHook = {
      socket: null,
      isConnected: true,
      createRoom: jest.fn(),
      joinRoom: jest.fn(),
      leaveRoom: jest.fn(),
      playerReady: jest.fn(),
      sendTypingProgress: jest.fn()
    };

    mockUseSocket.mockReturnValue(mockSocketHook);
    
    const { result } = renderHook(() => useInitializeSocket());
    
    const store = useRealMultiplayerStore.getState();
    expect(store.socketHook).toBe(mockSocketHook);
    expect(store.isConnected).toBe(true);
  });
});