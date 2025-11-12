# ADR-003: Centralized Game Engine on the Backend

**Status:** Accepted  
**Date:** 2025-11-12  
**Author:** senyaak

## Context

In multiplayer games, there is a fundamental question: where should the game logic be stored and processed?

**Game logic includes:**
- Move validation (e.g., can a property be purchased?)
- Event handling (e.g., landing on a cell, drawing cards)
- State management (e.g., player positions, property ownership)
- Transactions (e.g., buying, selling, taxes)
- Determining the winner

**Possible architectures:**
1. Server-authoritative (logic on the server)
2. Client-side prediction (duplicated on the client)
3. P2P (no central server)

## Considered Options

### Option 1: Server-authoritative (Chosen)

**Architecture:**
```
┌─────────────┐                  ┌──────────────────┐
│  Client 1   │                  │   NestJS Server  │
│  (Angular)  │   WebSocket      │                  │
│             ├─────────────────►│  Game Engine     │
│  UI only    │   "buyProperty"  │  ├─ Game class   │
│             │◄─────────────────┤  ├─ Player       │
└─────────────┘   state update   │  ├─ Board        │
                                 │  └─ Validation   │
┌─────────────┐                  │                  │
│  Client 2   │   WebSocket      │  Authoritative   │
│  (Angular)  ├─────────────────►│  Source of Truth │
│             │◄─────────────────┤                  │
└─────────────┘                  └──────────────────┘
```

**Implementation:**
```typescript
// Backend - Game Engine
export class Game {
  @ValidateActivePlayer
  @RequireGameState(GameStateType.Active)
  public nextTurn(playerId: string, diceCounter?: number): ITurnResult {
    // Server-side validation
    if (!this.isPlayerActive(playerId)) {
      throw new Error('Not your turn');
    }
    
    const diceResult = this.rollDice(diceCounter);
    this.players[this.currentPlayer].move(diceResult.total);
    
    return {
      dice: diceResult,
      newPosition: this.players[this.currentPlayer].Position,
      // ... other data
    };
  }

  buyProperty(): PropertyBoughtResultSuccess {
    const player = this.players[this.currentPlayer];
    const cell = this.board.flatCells[player.Position];
    
    // Server-side validation
    if (!(cell instanceof PropertyCell)) {
      throw new Error('Not a property cell');
    }
    if (cell.object.owner !== null) {
      throw new Error('Already owned');
    }
    if (player.Money < cell.object.price) {
      throw new Error('Not enough money');
    }
    
    // Execute transaction
    player.changeMoney(-cell.object.price);
    cell.object.owner = player.Id;
    
    return { success: true, propertyIndex: player.Position, ... };
  }
}

// Frontend - UI only
export class GameControlComponent {
  buyProperty() {
    // Client simply sends the command
    this.gameService.Socket.emit('buyProperty');
    
    // Waits for new event from server 
    // NO local validation excep UI
  }
}
```

**Pros:**
- **Impossible to cheat**: All logic is on the server
- **Single source of truth**: The server state is always correct
- **Simple synchronization**: The server sends one state to all clients
- **Easier to maintain**: Logic is centralized
- **Easier to test**: The Game Engine can be tested independently of the UI

**Cons:**
- **Latency**: Every action requires a round-trip to the server
- **Server dependency**: The game cannot function without the server
- **No offline mode**: Cannot play without a connection

### Option 2: Client-side prediction

**Architecture:**
```
┌─────────────────────────────┐         ┌──────────────────┐
│  Client (Angular)           │         │  NestJS Server   │
│  ┌────────────────────────┐ │         │                  │
│  │  Local Game Engine     │ │         │  Game Engine     │
│  │  - Prediction          │ │         │  (Authority)     │
│  │  - Instant feedback    │ │         │                  │
│  └────────────────────────┘ │         │                  │
│             │               │         │                  │
│  1. Execute locally         │         │                  │
│  2. Send to server ─────────┼────────►│  3. Validate     │
│  4. Reconcile if mismatch◄──┼─────────┤  5. Broadcast    │
└─────────────────────────────┘         └──────────────────┘
```

**Implementation:**
```typescript
// Frontend - Local Game Engine (copy of server logic)
export class GameService {
  private localGame: Game;
  
  buyProperty() {
    // 1. Execute locally for instant feedback
    const prediction = this.localGame.buyProperty();
    this.updateUI(prediction);
    
    // 2. Send to server
    this.socket.emit('buyProperty');
    
    // 3. Receive authoritative result
    this.socket.on('propertyBought', (serverResult) => {
      // 4. Reconcile if prediction mismatches
      if (serverResult.propertyIndex !== prediction.propertyIndex) {
        this.rollbackAndApply(serverResult);
      }
    });
  }
}
```

**Pros:**
- **Instant feedback**: No latency on the UI
- **Better UX**: The game feels more responsive
- **Works during lag**: Can continue playing even with delays

**Cons:**
- **Duplicated logic**: Game Engine exists on both the server and client
- **Complexity**: Requires a reconciliation mechanism
- **More code**: Twice as many tests
- **Risk of desynchronization**: Bugs if logic differs
- **Harder to maintain**: Changes must be made in two places

### Option 3: P2P (No Central Server)

**Architecture:**
```
┌─────────────┐              ┌─────────────┐
│  Client 1   │              │  Client 2   │
│  (Host)     │◄────────────►│  (Peer)     │
│  Game Engine│   WebRTC     │  Sync only  │
└─────────────┘              └─────────────┘
       ▲                            │
       │       ┌─────────────┐      │
       └───────┤  Client 3   │──────┘
               │  (Peer)     │
               └─────────────┘
```

**Pros:**
- No server load
- Works offline (LAN)
- Scales for free

**Cons:**
- **Cheating**: The host can modify the rules
- **Complex synchronization**: Conflict resolution is non-trivial
- **Host dependency**: If the host leaves, the game ends
- **NAT traversal**: WebRTC requires STUN/TURN servers
- **Not suitable for Comersant**: Game fairness is critical

## Decision

**Chosen Option 1: Server-authoritative architecture**

### Justification:

1. **Game fairness**: In a Monopoly-like game, cheating is unacceptable. Only the server can guarantee fairness.

2. **Latency is acceptable for a turn-based game**:
   ```
   Round-trip latency: ~50-100ms (within the country)
   ```
   For a turn-based game, this is unnoticeable. In FPS games, it would be an issue, but not in a board game.

3. **Simplicity of development and maintenance**:
   ```typescript
   // Logic in one place
   // src/modules/game/models/GameModels/game.ts
   class Game {
     nextTurn() { /* ... */ }
     buyProperty() { /* ... */ }
     handleEvent() { /* ... */ }
   }
   ```
   One version of the logic → fewer bugs.

4. **Decorators for security**:
   ```typescript
   @ValidateActivePlayer
   @RequireGameState(GameStateType.Active)
   public nextTurn(playerId: string) {
     // Automatic validation before execution
   }
   ```

5. **TypeScript types shared between frontend and backend**:
   ```typescript
   // Frontend imports server types
   import { Player } from '$server/modules/game/models/GameModels/player';
   import { PropertyCell } from '$server/modules/game/models/FieldModels/cells';
   ```
   But does NOT import logic—only types for type safety.

6. **Easy to test**:
   ```typescript
   // Backend unit test
   describe('Game', () => {
     it('should prevent buying owned property', () => {
       const game = new Game(players);
       game.buyProperty(); // Player 1 buys
       
       expect(() => game.buyProperty()).toThrow('Already owned');
     });
   });
   ```

### How it works:

**1. Client sends a command:**
```typescript
// Frontend
this.socket.emit('buyProperty');
```

**2. Server validates and executes:**
```typescript
// Backend Gateway
@SubscribeMessage('buyProperty')
handleBuyProperty(@ConnectedSocket() client: Socket) {
  const game = this.gamesService.getGameByPlayerId(client.id);
  
  try {
    const result = game.buyProperty(); // All logic here
    this.server.to(game.id).emit('propertyBought', result);
  } catch (error) {
    client.emit('error', { message: error.message });
  }
}
```

**3. All clients receive the update:**
```typescript
// Frontend
this.socket.on('propertyBought', (result) => {
  // Simply update the UI
  this.Game.board.flatCells[result.propertyIndex].object.owner = result.newOwnerId;
  this.Game.players[this.Game.CurrentPlayer].changeMoney(-result.price);
});
```

## Consequences

### Positive

✅ **Impossible to cheat**: The client cannot forge results  
✅ **Single source of truth**: The server is always correct  
✅ **Simple synchronization**: The server broadcasts one state  
✅ **Easier to maintain**: Logic is centralized  
✅ **Easier to test**: The Game Engine is isolated from the UI  
✅ **Type safety**: The frontend uses server types  
✅ **Decorators**: Automatic validation

### Negative

❌ **Latency**: ~50-100ms delay for each action  
❌ **Server required**: Cannot play offline  
❌ **Single point of failure**: If the server crashes, the game is unavailable

### Risks

⚠️ **High latency**: If >200ms, it may be unpleasant. **Solution**: Deploy in regions with good ping.

⚠️ **Server crash**: All games are lost. **Solution**: Graceful shutdown, future persistence in Redis.

⚠️ **DDoS**: Requests can be spammed. **Solution**: Rate limiting on WebSocket events (e.g., max 10 actions per second per player).

## Why NOT client-side prediction?

Client-side prediction makes sense in:
- **Real-time shooters** (CS:GO, Valorant) — every millisecond matters
- **Racing games** — instant feedback on controls is needed
- **Action games** — gameplay depends on responsiveness

Comersant is a **turn-based game**:
- The player makes a move → waits for the result
- No continuous movement
- Latency of 50-100ms is unnoticeable

**Trade-off is not worth it:**
```
Advantage: -50ms latency
Cost: 2x code, complexity, risk of bugs
```

## Future Improvements

If responsiveness needs improvement:
- **Optimistic UI updates**: Show predictions, but the server remains the authority
- **Pre-validation on the client**: Do not send invalid commands (already implemented in UI)
- **WebSocket compression**: Reduce message size
- **Game state persistence**: Store active games in Redis to survive server restarts
- **Graceful reconnection**: Allow players to rejoin ongoing games after disconnection

## Example Full Flow

**Player buys property:**

```typescript
// 1. Frontend - User clicks "Buy"
buyProperty() {
  this.gameService.Socket.emit('buyProperty');
}

// 2. Backend - Gateway receives the event
@SubscribeMessage('buyProperty')
handleBuyProperty(@ConnectedSocket() client: Socket) {
  const game = this.gamesService.getGameByPlayerId(client.id);
  
  // 3. Game Engine validates and executes
  const result = game.buyProperty(); // Decorators validated player and state
  
  // 4. Broadcast to all players in the room
  this.server.to(game.id).emit('propertyBought', result);
  
  return result;
}

// 5. Game Engine - Business logic
buyProperty(): PropertyBoughtResultSuccess {
  const player = this.players[this.currentPlayer];
  const cell = this.board.flatCells[player.Position];
  
  // Validation
  if (!(cell instanceof PropertyCell)) throw new Error('Not a property');
  if (cell.object.owner !== null) throw new Error('Already owned');
  if (player.Money < cell.object.price) throw new Error('Not enough money');
  
  // Transaction
  player.changeMoney(-cell.object.price);
  cell.object.owner = player.Id;
  
  return {
    success: true,
    propertyIndex: player.Position,
    newOwnerId: player.Id,
    price: cell.object.price
  };
}

// 6. Frontend - All clients update the UI
this.socket.on('propertyBought', (result) => {
  const cell = this.Game.board.flatCells[result.propertyIndex];
  cell.object.owner = result.newOwnerId;
  
  this.Game.players[this.Game.CurrentPlayer].changeMoney(-result.price);
  this.propertyBought$.next(result);
});
```

**Execution time:**
(estimated, since exact timing is not critical for turn-based games)
```
User click → Send WS → Server process → Broadcast → UI update
    0ms         10ms         30ms           10ms        5ms
                              
Total: ~55ms (unnoticeable to the user)
```

## Notes

- Decorators `@ValidateActivePlayer` and `@RequireGameState` provide an additional layer of security
- The frontend can import server **types** via `$server/*`, but should not import server-runtime code (For this purpose we use for example ICGame in client, with no server logic like ID generation etc)
- All state mutations occur only on the server, then clients receive updates
- The frontend receives only diffs (changes), not the full state each time

## Related ADRs

- [ADR-001: Monorepo Structure](./ADR-001-monorepo-structure.md) — how shared types work
