import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MultiplayerLobby } from './MultiplayerLobby';
import { useRealMultiplayerStore } from '../store/realMultiplayerStore';
import { useSocket } from '../hooks/useSocket';
import type { Room, Player } from '../types/multiplayer.types';

// Mock the useSocket hook
jest.mock('../hooks/useSocket');
const mockUseSocket = useSocket as jest.MockedFunction<typeof useSocket>;

// Mock the store
jest.mock('../store/realMultiplayerStore', () => ({
  useRealMultiplayerStore: jest.fn(),
  useInitializeSocket: jest.fn()
}));

const mockUseRealMultiplayerStore = useRealMultiplayerStore as jest.MockedFunction<typeof useRealMultiplayerStore>;
const mockUseInitializeSocket = require('../store/realMultiplayerStore').useInitializeSocket;

describe('MultiplayerLobby', () => {
  let mockStoreState: any;
  let mockSocketHook: any;

  beforeEach(() => {
    // Default store state
    mockStoreState = {
      room: null,
      currentPlayer: null,
      cursorIndex: 0,
      isConnected: false,
      error: null,
      createRoom: jest.fn(),
      joinRoom: jest.fn(),
      leaveRoom: jest.fn(),
      playerReady: jest.fn(),
      typeChar: jest.fn(),
      backspace: jest.fn()
    };

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
    mockUseInitializeSocket.mockReturnValue(mockSocketHook);
    
    // Mock the store selector function
    mockUseRealMultiplayerStore.mockImplementation((selector) => {
      if (typeof selector === 'function') {
        return selector(mockStoreState);
      }
      return mockStoreState;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('No Room State', () => {
    it('should display connection status when disconnected', () => {
      mockStoreState.isConnected = false;
      
      render(<MultiplayerLobby />);
      
      expect(screen.getByText('Disconnected')).toBeInTheDocument();
      expect(screen.getByText('Buat Room')).toBeDisabled();
      expect(screen.getByText('Gabung Room')).toBeDisabled();
    });

    it('should display connection status when connected', () => {
      mockStoreState.isConnected = true;
      
      render(<MultiplayerLobby />);
      
      expect(screen.getByText('Connected')).toBeInTheDocument();
      expect(screen.getByText('Buat Room')).toBeEnabled();
      expect(screen.getByText('Gabung Room')).toBeEnabled();
    });

    it('should display error message when present', () => {
      mockStoreState.error = 'Connection failed';
      
      render(<MultiplayerLobby />);
      
      expect(screen.getByText('Connection Error:')).toBeInTheDocument();
      expect(screen.getByText('Connection failed')).toBeInTheDocument();
    });

    it('should call createRoom when create button is clicked', () => {
      mockStoreState.isConnected = true;
      
      render(<MultiplayerLobby />);
      
      fireEvent.click(screen.getByText('Buat Room'));
      
      expect(mockStoreState.createRoom).toHaveBeenCalledWith('Player');
    });

    it('should prompt for room code and call joinRoom when join button is clicked', () => {
      mockStoreState.isConnected = true;
      
      // Mock window.prompt
      const mockPrompt = jest.spyOn(window, 'prompt').mockReturnValue('TESTROOM');
      
      render(<MultiplayerLobby />);
      
      fireEvent.click(screen.getByText('Gabung Room'));
      
      expect(mockPrompt).toHaveBeenCalledWith('Enter room code:');
      expect(mockStoreState.joinRoom).toHaveBeenCalledWith('TESTROOM', 'Player');
      
      mockPrompt.mockRestore();
    });
  });

  describe('Waiting Room State', () => {
    beforeEach(() => {
      const testPlayer: Player = {
        id: 'player-1',
        username: 'TestPlayer',
        country: '🇺🇸',
        progress: 0,
        wpm: 0,
        accuracy: 100,
        isFinished: false
      };

      const testRoom: Room = {
        id: 'test-room',
        code: 'TESTROOM',
        status: 'waiting',
        players: [testPlayer],
        maxPlayers: 4,
        targetText: 'hello world'
      };

      mockStoreState.room = testRoom;
      mockStoreState.currentPlayer = testPlayer;
      mockStoreState.isConnected = true;
    });

    it('should display room code', () => {
      render(<MultiplayerLobby />);
      
      expect(screen.getByText('TESTROOM')).toBeInTheDocument();
    });

    it('should display player count', () => {
      render(<MultiplayerLobby />);
      
      expect(screen.getByText('Pemain (1/4)')).toBeInTheDocument();
    });

    it('should display player information', () => {
      render(<MultiplayerLobby />);
      
      expect(screen.getByText('TestPlayer')).toBeInTheDocument();
      expect(screen.getByText('🇺🇸')).toBeInTheDocument();
    });

    it('should call playerReady when ready button is clicked', () => {
      render(<MultiplayerLobby />);
      
      fireEvent.click(screen.getByText('Player Ready'));
      
      expect(mockStoreState.playerReady).toHaveBeenCalled();
    });

    it('should call leaveRoom when leave button is clicked', () => {
      render(<MultiplayerLobby />);
      
      fireEvent.click(screen.getByText('Keluar'));
      
      expect(mockStoreState.leaveRoom).toHaveBeenCalled();
    });
  });

  describe('Countdown State', () => {
    beforeEach(() => {
      const testRoom: Room = {
        id: 'test-room',
        code: 'TESTROOM',
        status: 'countdown',
        players: [],
        maxPlayers: 4,
        targetText: 'hello world',
        countdown: 3
      };

      mockStoreState.room = testRoom;
    });

    it('should display countdown', () => {
      render(<MultiplayerLobby />);
      
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('Race dimulai dalam')).toBeInTheDocument();
    });
  });

  describe('Racing State', () => {
    beforeEach(() => {
      const testPlayer: Player = {
        id: 'player-1',
        username: 'TestPlayer',
        country: '🇺🇸',
        progress: 50,
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

      mockStoreState.room = testRoom;
      mockStoreState.currentPlayer = testPlayer;
      mockStoreState.cursorIndex = 5;
    });

    it('should display player progress', () => {
      render(<MultiplayerLobby />);
      
      expect(screen.getByText('TestPlayer')).toBeInTheDocument();
      expect(screen.getByText('45 WPM')).toBeInTheDocument();
    });

    it('should display target text with cursor position', () => {
      render(<MultiplayerLobby />);
      
      // The text should be split and styled based on cursor position
      expect(screen.getByText('hello world')).toBeInTheDocument();
    });

    it('should handle keydown events for typing', () => {
      render(<MultiplayerLobby />);
      
      // Simulate keydown event
      fireEvent.keyDown(window, { key: 'h' });
      
      expect(mockStoreState.typeChar).toHaveBeenCalledWith('h', 'l'); // cursor is at position 5, so expected char is 'l'
    });

    it('should handle backspace keydown', () => {
      render(<MultiplayerLobby />);
      
      // Simulate backspace keydown event
      fireEvent.keyDown(window, { key: 'Backspace' });
      
      expect(mockStoreState.backspace).toHaveBeenCalled();
    });

    it('should ignore special key combinations', () => {
      render(<MultiplayerLobby />);
      
      // Simulate keydown with ctrl key
      fireEvent.keyDown(window, { key: 'a', ctrlKey: true });
      
      expect(mockStoreState.typeChar).not.toHaveBeenCalled();
    });
  });

  describe('Finished State', () => {
    beforeEach(() => {
      const finishedPlayer: Player = {
        id: 'player-1',
        username: 'TestPlayer',
        country: '🇺🇸',
        progress: 100,
        wpm: 65,
        accuracy: 98,
        isFinished: true,
        finishRank: 1
      };

      const testRoom: Room = {
        id: 'test-room',
        code: 'TESTROOM',
        status: 'finished',
        players: [finishedPlayer],
        maxPlayers: 4,
        targetText: 'hello world'
      };

      mockStoreState.room = testRoom;
      mockStoreState.currentPlayer = finishedPlayer;
    });

    it('should display finished badge', () => {
      render(<MultiplayerLobby />);
      
      expect(screen.getByText('Race Selesai')).toBeInTheDocument();
    });

    it('should display finish rank', () => {
      render(<MultiplayerLobby />);
      
      expect(screen.getByText('#1')).toBeInTheDocument();
    });

    it('should display race again and leave buttons', () => {
      render(<MultiplayerLobby />);
      
      expect(screen.getByText('Race Lagi')).toBeInTheDocument();
      expect(screen.getByText('Keluar')).toBeInTheDocument();
    });

    it('should call createRoom when race again button is clicked', () => {
      render(<MultiplayerLobby />);
      
      fireEvent.click(screen.getByText('Race Lagi'));
      
      expect(mockStoreState.createRoom).toHaveBeenCalled();
    });
  });

  describe('Socket Integration', () => {
    it('should initialize socket connection on mount', () => {
      render(<MultiplayerLobby />);
      
      expect(mockUseInitializeSocket).toHaveBeenCalled();
    });

    it('should use real multiplayer store instead of simulation store', () => {
      render(<MultiplayerLobby />);
      
      // Verify that the component is calling the real store selectors
      expect(mockUseRealMultiplayerStore).toHaveBeenCalledWith(expect.any(Function));
    });
  });
});