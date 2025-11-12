# ADR-002: Frontend State Management Using BehaviorSubject and Getters

**Status:** Accepted  
**Date:** 2025-11-12  
**Author:** senyaak

## Context

The Angular application manages complex state:
- Game state (Game, Board, Players)
- UI state (current screen, modals)
- WebSocket events (nextTurn, propertyBought, playerMoved)
- User settings

We need to choose an approach to state management. Angular offers many solutions: NgRx, Akita, Signals, RxJS, or simple services.

## Considered Options

### Option 1: Getters + BehaviorSubject (Chosen)

**Implementation:**
```typescript
@Injectable({ providedIn: 'root' })
export class GameService {
  private Game: ICGame = new ICGame();
  
  // Events via BehaviorSubject
  private propertyBought$ = new BehaviorSubject<PropertyBoughtResult | null>(null);
  private gameReady$ = new BehaviorSubject<boolean>(false);
  
  // Getters for direct access
  get Player() {
    return this.Game.players.find(p => p.Id === this.socket.id)!;
  }
  
  get ownedProperties() {
    return this.Game.board.flatCells.reduce((acc, cell) => {
      if (cell instanceof PropertyCell && cell.object.owner) {
        const ownerId = cell.object.owner;
        if (!acc[ownerId]) acc[ownerId] = [];
        acc[ownerId].push(cell);
      }
      return acc;
    }, {} as Record<string, PropertyCell[]>);
  }
}

// Usage in components
export class GameControlComponent {
  constructor(private gameService: GameService) {}
  
  get canBuyProperty(): boolean {
    const cell = this.gameService.Game.board.flatCells[this.Player.Position];
    return cell instanceof PropertyCell && cell.object.owner === null;
  }
}
```

**Pros:**
- **Simplicity**: No boilerplate code (actions, reducers, effects)
- **Direct access**: `this.gameService.Game.players[0]` without selectors
- **Type safety**: TypeScript automatically infers types
- **Flexibility**: Computed properties can be written in getters
- **Fast development**: No need to learn the Redux pattern
- **Change detection works**: Angular tracks changes through getters

**Cons:**
- No centralized history of changes (like in NgRx DevTools)
- If data became more complex, risk of performance issues with getters

### Option 2: NgRx (Redux Pattern)

**Implementation:**
```typescript
// Actions
export const buyProperty = createAction('[Game] Buy Property');
export const propertyBought = createAction(
  '[Game] Property Bought', 
  props<{ result: PropertyBoughtResult }>()
);

// Reducer
export const gameReducer = createReducer(
  initialState,
  on(propertyBought, (state, { result }) => ({
    ...state,
    game: updatePropertyOwner(state.game, result)
  }))
);

// Selectors
export const selectCurrentPlayer = createSelector(
  selectGame,
  (game) => game.players[game.currentPlayer]
);

// Effects
@Injectable()
export class GameEffects {
  buyProperty$ = createEffect(() =>
    this.actions$.pipe(
      ofType(buyProperty),
      switchMap(() => this.socket.emit('buyProperty')),
      map(result => propertyBought({ result }))
    )
  );
}

// Usage
export class GameComponent {
  currentPlayer$ = this.store.select(selectCurrentPlayer);
  
  buyProperty() {
    this.store.dispatch(buyProperty());
  }
}
```

**Pros:**
- **Redux DevTools**: See all state changes
- **Immutability**: Prevents accidental mutations
- **Testability**: Easy to test reducers and effects
- **Scalability**: Scales well for large projects
- **Predictability**: Strict data flow (actions → reducers → state)

**Cons:**
- **Boilerplate**: Many files (actions, reducers, effects, selectors)
- **Complexity**: Steep learning curve
- **Verbose**: Even simple changes require a lot of code
- **Overkill**: Excessive for a project of this size
- **Async is harder**: Effects add another layer of abstraction

### Option 3: RxJS Only (Everything via Observables)

**Pros:**
- Reactive out of the box
- Powerful operators

**Cons:**
- Difficult for beginners
- Many async pipes in templates
- Memory leaks if unsubscribe is forgotten
- Harder to manage complex state

## Decision

**Chosen Option 1: Getters + BehaviorSubject for Events**

### Justification:

1. **Project size**: Comersant is a small application. NgRx would be overkill.

2. **Development speed**: 
   ```typescript
   // Current approach (1 line)
   get canBuyProperty() { return this.gameService.Game... }
   
   // NgRx (at least 10 lines + files)
   canBuyProperty$ = this.store.select(selectCanBuyProperty);
   ```

3. **Server as the source of truth**: State comes from the server via WebSocket. No complex client logic requiring Redux.

4. **Type safety without selectors**: TypeScript automatically infers types, no explicit selector functions needed.

5. **BehaviorSubject for async events**: Used only where reactivity is needed:
   ```typescript
   // Events from the server
   this.propertyBought$.subscribe(result => {
     this.loadPlayerProperties();
   });
   ```

6. **Change detection works**: Angular tracks changes through getters in templates:
   ```html
   <div>{{ gameService.Player.Name }}</div>
   <div *ngIf="canBuyProperty">Buy</div>
   ```

### Usage Patterns:

**1. Synchronous State → Getters**
```typescript
get Player() {
  return this.Game.players.find(p => p.Id === this.socket.id)!;
}

get ownedProperties() {
  return this.Game.board.flatCells.filter(/* ... */);
}
```

**2. Asynchronous Events → BehaviorSubject**
```typescript
private propertyBought$ = new BehaviorSubject<PropertyBoughtResult | null>(null);

// In socket listener
this.socket.on('propertyBought', (result) => {
  this.propertyBought$.next(result);
});

// In component
ngOnInit() {
  this.propertyBoughtSubscription = this.gameService.propertyBought$
    .subscribe(result => {
      if (result?.success) {
        this.loadPlayerProperties();
      }
    });
}
```

**3. Computed Properties → Getters in Components**
```typescript
get canBuyProperty(): boolean {
  const cell = this.gameService.Game.board.flatCells[this.Player.Position];
  return cell instanceof PropertyCell 
    && cell.object.owner === null
    && this.Player.Money >= cell.object.price;
}
```

## Consequences

### Positive

✅ **Minimal code**: No actions, reducers, effects  
✅ **Fast development**: From idea to implementation in minutes  
✅ **Type safety**: TypeScript checks everything automatically  
✅ **Easy onboarding**: New developers understand the code immediately  
✅ **Flexibility**: Computed properties can be easily added  
✅ **Debugging**: Simple console.log works well

### Negative

❌ **No time-travel debugging**: Cannot roll back state  
❌ **No centralized history**: Harder to track who changed what  
❌ **No DevTools**: No visualization of data flow

### Risks

⚠️ **Change detection performance**: Getters are called on every CD cycle. **Mitigation**: Use OnPush strategy and memoization if needed.

## Code Examples

**GameService:**
```typescript
@Injectable({ providedIn: 'root' })
export class GameService {
  private Game: ICGame = new ICGame();
  private socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  
  private propertyBought$ = new BehaviorSubject<PropertyBoughtResult | null>(null);
  private gameReady$ = new BehaviorSubject<boolean>(false);
  
  get Player() {
    return this.Game.players.find(player => player.Id === this.socket.id)!;
  }
  
  get ownedProperties(): Record<Player['id'], PropertyCell[]> {
    return this.Game.board.flatCells.reduce((acc, cell) => {
      if (cell instanceof PropertyCell && cell.object.owner) {
        const ownerId = cell.object.owner;
        if (!acc[ownerId]) acc[ownerId] = [];
        acc[ownerId].push(cell);
      }
      return acc;
    }, {} as Record<Player['id'], PropertyCell[]>);
  }
}
```

**Component:**
```typescript
export class GameControlComponent {
  constructor(private gameService: GameService) {}
  
  get canBuyProperty(): boolean {
    const cell = this.gameService.Game.board.flatCells[this.Player.Position];
    if (cell instanceof PropertyCell === false) return false;
    
    const hasMoney = cell.object.price < this.Player.Money;
    const canBuyCell = cell.object.owner === null;
    return this.TurnState === Turn.Event && this.isMyTurn && canBuyCell && hasMoney;
  }
  
  buyProperty() {
    this.gameService.Socket.emit('buyProperty');
  }
}
```

## Future Alternatives

If the project grows:
- **NgRx Component Store**: Local state management without a global store

## Notes

- All subscriptions are unsubscribed in `ngOnDestroy()`
- The Game object is not fully replaced, only changed fields are updated

## Related ADRs

- [ADR-006: Server-authoritative game engine](./ADR-006-server-authoritative-game-engine.md) — server as the source of truth
