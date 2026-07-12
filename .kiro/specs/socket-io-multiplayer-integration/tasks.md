# Implementation Plan: Socket.IO Multiplayer Integration

## Overview

This implementation plan converts the existing simulation-based multiplayer functionality to real Socket.IO multiplayer. The plan integrates the existing Real Multiplayer Store with the Socket.IO server, updates the MultiplayerLobby component to use the real store instead of simulation, and ensures proper error handling and result persistence.

## Tasks

- [ ] 1. Set up Socket.IO client integration in Real Multiplayer Store
  - Integrate Socket.IO client with the existing Real Multiplayer Store
  - Replace placeholder connection state management with real Socket.IO events
  - Implement proper event listeners for all server events (room_created, room_joined, room_update, countdown_start, countdown_tick, race_start, error)
  - Add connection state management and error handling
  - _Requirements: 1.1, 1.2, 1.3, 8.1_

  - [ ]* 1.1 Write property test for connection state consistency
    - **Property 1: Connection State Consistency**
    - **Validates: Requirements 1.2, 1.3**

- [ ] 2. Implement real-time room management functionality
  - [~] 2.1 Add room creation and joining actions to Real Multiplayer Store
    - Implement createRoom and joinRoom actions that emit Socket.IO events
    - Handle server responses for room_created and room_joined events
    - Update store state when room operations complete successfully
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ]* 2.2 Write property test for room creation and management
    - **Property 2: Room Creation and Management**
    - **Validates: Requirements 2.1, 2.2**

  - [ ]* 2.3 Write property test for room joining and capacity management
    - **Property 3: Room Joining and Capacity Management**
    - **Validates: Requirements 2.3, 2.4**

  - [~] 2.4 Implement player management and room cleanup
    - Add leaveRoom action and handle player removal logic
    - Implement automatic room cleanup when all players leave
    - Handle room_update events to synchronize player lists
    - _Requirements: 2.5, 2.6_

  - [ ]* 2.5 Write property test for player management and cleanup
    - **Property 4: Player Management and Cleanup**
    - **Validates: Requirements 2.5, 2.6**

- [~] 3. Checkpoint - Ensure basic room functionality works
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Implement real-time typing progress synchronization
  - [~] 4.1 Integrate typing progress with Socket.IO events
    - Modify typeChar and backspace actions to emit typing_progress events
    - Calculate and send progress data (WPM, accuracy, completion percentage, character counts)
    - Handle incoming progress updates from other players via room_update events
    - _Requirements: 5.1, 5.2, 5.3, 5.5_

  - [ ]* 4.2 Write property test for progress broadcast synchronization
    - **Property 5: Progress Broadcast Synchronization**
    - **Validates: Requirements 3.1, 3.5, 5.2, 5.3**

  - [~] 4.3 Implement race state management and finish detection
    - Add logic to detect when players finish and calculate finish ranks
    - Handle race completion and room status transitions
    - Update player finishing status and rankings
    - _Requirements: 3.3, 3.4_

  - [ ]* 4.4 Write property test for race state management
    - **Property 6: Race State Management**
    - **Validates: Requirements 3.3, 3.4**

- [ ] 5. Implement countdown and race start synchronization
  - [~] 5.1 Add countdown and race start event handling
    - Implement playerReady action to emit ready status
    - Handle countdown_start, countdown_tick, and race_start events
    - Synchronize race start timing and target text across all clients
    - Update local race state when race starts
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 5.2 Write property test for race start synchronization
    - **Property 8: Race Start Synchronization**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.5**

- [ ] 6. Update MultiplayerLobby component integration
  - [~] 6.1 Switch MultiplayerLobby to use Real Multiplayer Store
    - Update import to use useRealMultiplayerStore instead of useMultiplayerStore
    - Ensure all store actions and state properties map correctly
    - Maintain existing UI behavior and interaction patterns
    - Remove simulation-specific logic (bot ticking, manual countdown)
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ]* 6.2 Write property test for UI state synchronization
    - **Property 7: UI State Synchronization**
    - **Validates: Requirements 3.2, 8.2, 8.4**

  - [ ]* 6.3 Write property test for component integration consistency
    - **Property 12: Component Integration Consistency**
    - **Validates: Requirements 8.1, 8.3, 8.5**

- [~] 7. Checkpoint - Ensure UI integration works correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement typing input processing and progress calculation
  - [~] 8.1 Enhance typing actions with real-time progress updates
    - Update typeChar action to calculate accurate progress metrics
    - Implement proper WPM, accuracy, and character count calculations
    - Add backspace handling with metric recalculation
    - Ensure progress updates are sent to server in real-time
    - _Requirements: 5.1, 5.4, 5.5_

  - [ ]* 8.2 Write property test for typing input processing
    - **Property 9: Typing Input Processing**
    - **Validates: Requirements 5.1, 5.4, 5.5**

- [ ] 9. Implement connection recovery and error handling
  - [~] 9.1 Add connection recovery logic
    - Implement automatic reconnection after disconnection
    - Add logic to rejoin previous room if still active
    - Handle rejoin failures with graceful state reset
    - Add connection warning displays during interruptions
    - _Requirements: 1.4, 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ]* 9.2 Write property test for connection recovery and room rejoining
    - **Property 11: Connection Recovery and Room Rejoining**
    - **Validates: Requirements 1.4, 7.3, 7.4**

- [ ] 10. Verify server-side result persistence integration
  - [~] 10.1 Test and verify automatic result saving
    - Verify that the existing server-side result persistence works correctly
    - Test race completion triggers automatic saving to Supabase
    - Ensure all required result data is included (duration, metrics, rankings)
    - Add error handling for save failures without disrupting gameplay
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ]* 10.2 Write property test for result persistence completeness
    - **Property 10: Result Persistence Completeness**
    - **Validates: Requirements 6.1, 6.2, 6.5**

- [ ] 11. Implement environment configuration
  - [~] 11.1 Add environment-based Socket.IO server configuration
    - Ensure NEXT_PUBLIC_SOCKET_URL environment variable is used
    - Add fallback to localhost:4000 for local development
    - Configure secure WebSocket connections (WSS) for production
    - Set up appropriate CORS settings for different environments
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ]* 11.2 Write unit tests for environment configuration
    - Test environment variable handling and URL configuration
    - Test default fallback behavior for missing environment variables
    - _Requirements: 9.1, 9.2_

- [ ] 12. Final integration and cleanup
  - [~] 12.1 Remove simulation-based store dependencies
    - Update any remaining references from multiplayerStore to realMultiplayerStore
    - Remove unused simulation logic and bot-related code from the UI
    - Clean up imports and remove the old simulation store if no longer needed
    - Verify all functionality works with real Socket.IO integration
    - _Requirements: 8.1, 8.5_

  - [ ]* 12.2 Write integration tests for complete multiplayer flow
    - Test full multiplayer workflow: create room, join players, race, save results
    - Test cross-client communication and state synchronization
    - _Requirements: All requirements_

- [~] 13. Final checkpoint - Ensure all functionality works end-to-end
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties defined in the design document
- The existing Socket.IO server implementation is already functional and should work with the client integration
- Focus on replacing simulation logic with real Socket.IO communication while maintaining the same user experience