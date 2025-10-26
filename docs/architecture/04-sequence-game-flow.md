# Game Turn Flow - Sequence Diagram

```mermaid
sequenceDiagram
    participant P1 as 👤 Player 1<br/>(Active)
    participant A1 as 📱 Angular App<br/>(Player 1)
    participant GW as ⚡ Game Gateway<br/>(WebSocket)
    participant GE as 🎯 Game Engine<br/>(Core Logic)
    participant A2 as 📱 Angular App<br/>(Player 2)
    participant P2 as 👤 Player 2<br/>(Waiting)
    
    Note over P1,P2: Game Turn Processing Flow
    
    P1->>A1: Click "Roll Dice"
    A1->>GW: nextTurn(diceCounter: 3)
    Note over GW: WebSocket /game namespace
    
    GW->>GE: nextTurn(playerId, diceCounter)
    Note over GE: Validation & Processing:<br/>1. Validate active player<br/>2. Roll dice (random)<br/>3. Move player on board<br/>4. Handle cell events<br/>5. Update turn state
    
    GE-->>GW: Return ITurnResult
    Note over GE,GW: Contains:<br/>- dice results<br/>- new position<br/>- event results<br/>- turn status
    
    par Broadcast to all players
        GW->>A1: turn_progress event
        GW->>A2: turn_progress event
    end
    
    A1->>P1: Update UI<br/>(board position, dice result)
    A2->>P2: Update UI<br/>(opponent moved)
    
    Note over P1,P2: Turn completed, next player's turn
    
    alt Property Purchase Available
        P1->>A1: Click "Buy Property"
        A1->>GW: buyProperty()
        GW->>GE: buyProperty(playerId)
        GE-->>GW: PropertyBoughtResult
        par Broadcast property update
            GW->>A1: propertyBought event
            GW->>A2: propertyBought event
        end
        A1->>P1: Show purchase success
        A2->>P2: Show property ownership change
    end
```

**Key Events:**
- **nextTurn**: Core turn processing with dice roll and movement
- **buyProperty**: Property purchase transaction
- **turn_progress**: Real-time game state synchronization
- **propertyBought**: Property ownership updates

**Validation & Security:**
- Player validation through `@ValidateActivePlayer` decorator
- Game state managed centrally on server
- All clients receive synchronized updates