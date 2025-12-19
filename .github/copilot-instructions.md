# Copilot Instructions for Comersant

## Project Overview

**Comersant** is a multiplayer board game (Monopoly-style) with server-authoritative architecture. This is a **monorepo** containing:
- **Backend** (`src/`): NestJS + WebSocket gateway + Game engine
- **Frontend** (`comersant-frontend/`): Angular SPA with Socket.IO client
- **Shared types**: Backend types imported directly into frontend via `$server/*` alias

## Critical Architecture Patterns

### 1. Monorepo Type Sharing

Frontend imports backend types directly using TypeScript path aliases:

```typescript
// Frontend imports - NO code duplication
import { Player } from '$server/modules/game/models/GameModels/player';
import { PropertyCell } from '$server/modules/game/models/FieldModels/cells';
import type { ServerToClientEvents } from '$server/modules/game/services/events/types';
```

**Path alias config** in `comersant-frontend/tsconfig.json`:
```json
"paths": {
  "$server/*": ["../src/*"]
}
```

**When editing**: Changes to backend models automatically affect frontend - run linter in BOTH workspaces.

### 2. Server-Authoritative Game Logic

**All game logic lives on the backend.** Frontend is a "dumb" UI that:
- Emits player actions via WebSocket (`nextTurn`, `buyProperty`, `placeBid`)
- Receives state updates from server (`turn_finished`, `property_bought`, `auction_updated`)
- **NEVER validates** or computes game state locally

**Example**: Backend validates all moves
```typescript
// Backend: src/modules/game/models/GameModels/game.ts
@ValidateActivePlayer
@RequireGameState(GameStateType.Active)
public nextTurn(playerId: string, diceCounter?: number): ITurnResult {
  // Server validates turn, rolls dice, moves player
  // Frontend just renders the result
}
```

**Frontend MUST NOT**:
- Validate if a property can be purchased
- Calculate player positions or money
- Determine turn order
- All validation = backend decorators (`@ValidateActivePlayer`, `@RequireGameState`)

### 3. Frontend State Management

Uses **BehaviorSubjects + Getters** pattern (not NgRx). See `ADR-002`.

```typescript
// GameService stores state privately
private game: BehaviorSubject<ICGame> = new BehaviorSubject(new ICGame());
public diceRolled$ = new BehaviorSubject<RollTurnResult>({...});

// Getters provide computed access
get Player() {
  return this.Game.players.find(p => p.Id === this.socket.id)!;
}

get ownedProperties(): Record<Player['id'], PropertyCell[]> {
  return this.Game.board.flatCells.reduce(...);
}
```

**In components**: Subscribe to `BehaviorSubject` observables, access state via service getters.

### 4. WebSocket Communication

**Backend Gateway** (`src/modules/game/services/events/events.gateway.ts`):
- Decorated with `@ValidateGameId` to extract `gameId` from query params
- Emits to room: `this.server.to(\`game-${gameId}\`).emit('event', data)`

**Frontend Service** (`comersant-frontend/src/app/modules/game/services/game.service.ts`):
- Connects with query params: `io('http://localhost:3000/game', { query: { gameId, userName } })`
- Listens: `this.socket.on('turn_finished', (result) => {...})`
- Emits: `this.socket.emit('nextTurn', { diceCounter: 1 })`

## Development Workflows

### Running the Application

```bash
# Terminal 1 - Backend (serves frontend at http://localhost:3000)
npm run start:dev

# Terminal 2 - Frontend (builds to dist/, watched by backend)
cd comersant-frontend
npm run start:dev  # watch mode, builds to dist/
```

**Backend serves**:
- Angular app: `http://localhost:3000/`
- API docs: `http://localhost:3000/docs/`
- Architecture: `http://localhost:3000/docs/architecture/`
- ADRs: `http://localhost:3000/docs/adr/`

### Documentation Generation

```bash
# Generate ALL docs (TypeDoc + Compodoc + diagrams + navigation)
npm run docs:build

# Individual sections
npm run docs:backend      # TypeDoc for NestJS
npm run docs:frontend     # Compodoc for Angular
npm run docs:architecture # C4 diagrams
npm run docs:adr          # ADR index with navigation
```

**Scripts** in `scripts/` auto-generate navigation between doc sections. See `scripts/README.md`.

### Linting

**ESLint config** (`eslint.config.mjs` - shared by both workspaces):
- `perfectionist/sort-imports`: Auto-sorts imports
- `perfectionist/sort-classes`: Enforces member order (static → private → constructor → lifecycle → getters → methods)
- Angular lifecycle hooks grouped: `ngOnInit`, `ngOnDestroy`, etc.
- Max line length: 120 chars
- Single quotes, semicolons required

**Run linting**:
```bash
# Backend
npm run lint

# Frontend
cd comersant-frontend && npm run lint
```

## Code Organization

### Backend Structure
```
src/
├── modules/
│   ├── game/
│   │   ├── models/
│   │   │   ├── GameModels/       # Game, Player, Turn classes
│   │   │   ├── FieldModels/      # Board, Cell types
│   │   │   └── events.ts
│   │   ├── services/
│   │   │   ├── events/           # EventsGateway (WebSocket)
│   │   │   └── games/            # GamesService (state)
│   │   └── utils/
│   │       └── game.util.ts      # @ValidateGameId decorator
│   └── lobby/
└── types/                        # Shared route types
```

**Key decorators**:
- `@ValidateGameId`: Extract & validate `gameId` from socket handshake
- `@ValidateActivePlayer`: Ensure method caller is current player
- `@RequireGameState(state)`: Check game is in required state

### Frontend Structure
```
comersant-frontend/src/app/
├── modules/
│   ├── game/
│   │   ├── components/main/
│   │   │   ├── board/            # SVG game board
│   │   │   │   ├── cell/         # Cell components by type
│   │   │   │   └── pawn/         # Player pawns
│   │   │   └── UI/               # Control panels, info displays
│   │   ├── services/
│   │   │   ├── game.service.ts   # Main state & WebSocket
│   │   │   ├── game-state.service.ts
│   │   │   └── game-notification.service.ts
│   │   └── model/
│   │       └── ICGame.ts         # Client game model
│   └── lobby/
└── services/
    └── user-settings.service.ts
```

## Important Conventions

### State Mutations
- **Backend**: Only `Game` class mutates game state
- **Frontend**: Never mutate game objects - always create new instances when updating BehaviorSubjects

### Error Handling
- Backend throws errors, Gateway catches and emits error events to client
- Frontend displays errors via `GameNotificationService`

### TypeScript Strictness
- `strictPropertyInitialization: true` (both workspaces)
- `@typescript-eslint/no-non-null-assertion: error` - avoid `!` assertions
- Use type guards: `if (cell instanceof PropertyCell) { ... }`

### Component Lifecycle
- Angular components: Always implement `OnInit`, `OnDestroy` for subscriptions
- Unsubscribe in `ngOnDestroy` to prevent memory leaks

## References

- **ADR-001**: Monorepo rationale and type sharing setup
- **ADR-002**: Frontend state management (BehaviorSubject pattern)
- **ADR-003**: Server-authoritative architecture (detailed validation flow)
- **ADR-004**: Angular + NestJS technology stack decisions

All ADRs in `docs/adr/` with detailed context, alternatives considered, and consequences.
