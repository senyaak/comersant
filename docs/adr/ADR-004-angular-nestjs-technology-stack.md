# ADR-004: Angular + NestJS Technology Stack

**Status:** Accepted  
**Date:** 2025-11-12  
**Author:** senyaak

## Context

At the start of the Comersant project, a decision was needed on which frameworks to use for the frontend and backend. The game requires:

**Frontend requirements:**
- Real-time UI updates (WebSocket communication)
- Complex state management (game state, player info, board)
- Component-based architecture
- Type safety
- Good tooling and IDE support

**Backend requirements:**
- WebSocket support for real-time communication
- REST API for room management
- Game Engine with complex business logic
- Type safety
- Scalability for multiple concurrent games
- Easy testing

**Cross-cutting concerns:**
- TypeScript on both frontend and backend
- Shared types between client and server
- Developer experience
- Long-term maintainability
- Community support

## Options Considered

### Frontend Options

#### Option 1: Angular (Chosen)

```typescript
// Example: Component with DI and RxJS
@Component({
  selector: 'app-game-control',
  templateUrl: './game-control.component.html'
})
export class GameControlComponent implements OnInit {
  constructor(
    private gameService: GameService,
    private router: Router
  ) {}
  
  ngOnInit() {
    this.gameService.Game$.subscribe(game => {
      // Reactive updates
    });
  }
}
```

**Pros:**
- **Built-in Dependency Injection**: Same pattern as NestJS
- **RxJS out of the box**: Perfect for WebSocket streams
- **TypeScript-first**: Strong typing everywhere
- **Enterprise-ready**: Used in large-scale applications
- **Comprehensive framework**: Routing, forms, HTTP client included
- **CLI tooling**: Code generation, build optimization
- **Strict mode**: Catches errors at compile time

**Cons:**
- **Steeper learning curve**: More concepts to learn (hard for beginners)
- **Verbose**: More boilerplate than React/Vue
- **Bundle size**: Larger than competitors (mitigated with standalone components)
- **Less flexible**: Opinionated structure (though this can be a pro for consistency)

#### Option 2: React

```typescript
// Example: Component with hooks
function GameControl() {
  const [game, setGame] = useState<Game | null>(null);
  const gameService = useContext(GameServiceContext);
  
  useEffect(() => {
    const sub = gameService.Game$.subscribe(setGame);
    return () => sub.unsubscribe();
  }, []);
  
  return <div>...</div>;
}
```

**Pros:**
- **Flexibility**: Choose your own libraries
- **Large ecosystem**: Tons of libraries
- **Popular**: More examples available (though could be con due to much inaccurate info and varying quality)
- **Smaller bundle**: Can be optimized better
- **Easier to learn**: Simpler mental model

**Cons:**
- **No DI out of the box**: Have to use Context/custom solutions
- **Decision fatigue**: Need to choose router, state manager, form library
- **No official WebSocket story**: Need third-party libraries
- **Less structure**: Easier to create inconsistent code
- **Type safety requires discipline**: TypeScript is optional(danger of react types hell!)

#### Option 3: Vue 3

```typescript
// Example: Composition API
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useGameService } from '@/composables/useGameService';

const game = ref<Game | null>(null);
const gameService = useGameService();

onMounted(() => {
  gameService.Game$.subscribe(g => game.value = g);
});
</script>
```

**Pros:**
- **Easy to learn**: Intuitive API
- **Flexible**: Can use Options or Composition API
- **Good TypeScript support**: With Vue 3
- **Good performance**: Fast rendering
- **Growing ecosystem**: Improving rapidly

**Cons:**
- **Smaller ecosystem**: Less libraries than React
- **Less enterprise adoption**: Fewer large-scale examples
- **DI not built-in**: Provide/Inject is simpler than Angular DI
- **Less strict**: More room for inconsistency

### Backend Options

#### Option 1: NestJS (Chosen)

```typescript
// Example: WebSocket Gateway with DI
@WebSocketGateway()
export class GameGateway {
  constructor(
    private readonly gamesService: GamesService,
    private readonly playersService: PlayersService
  ) {}
  
  @SubscribeMessage('buyProperty')
  handleBuyProperty(@ConnectedSocket() client: Socket) {
    const game = this.gamesService.getGameByPlayerId(client.id);
    const result = game.buyProperty();
    this.server.to(game.id).emit('propertyBought', result);
    return result;
  }
}
```

**Pros:**
- **Dependency Injection**: Same as Angular, shared mental model
- **TypeScript-first**: Everything is typed
- **Decorators**: Clean, declarative code
- **WebSocket support**: Built-in with Socket.IO
- **Modular architecture**: Easy to organize complex apps
- **Testing utilities**: Built-in testing support
- **OpenAPI/Swagger**: Auto-generate API docs
- **Express/Fastify**: Can use either under the hood

**Cons:**
- **Learning curve**: Need to understand DI, decorators, modules
- **Opinionated**: Less flexibility than Express
- **Overhead**: More boilerplate for simple apps
- **Performance**: Slightly slower than raw Express (negligible for our use case)

#### Option 2: Express

```typescript
// Example: Raw Express
const app = express();

app.post('/api/game/:id/buy-property', (req, res) => {
  const game = gamesService.getGame(req.params.id);
  const result = game.buyProperty();
  io.to(game.id).emit('propertyBought', result);
  res.json(result);
});
```

**Pros:**
- **Simple**: Minimal abstraction
- **Flexible**: Total control
- **Popular**: Huge ecosystem
- **Performance**: Fast and lightweight
- **Easy to learn**: Simple API

**Cons:**
- **No structure**: Have to build everything yourself
- **No DI**: Manual dependency management
- **No WebSocket integration**: Need to set up Socket.IO manually
- **No TypeScript first-class support**: Types are via @types
- **Testing**: Need to set up testing infrastructure
- **Scalability**: Hard to organize large codebases

#### Option 3: Fastify

```typescript
// Example: Fastify with TypeScript
fastify.post<{ Params: { id: string } }>(
  '/api/game/:id/buy-property',
  async (request, reply) => {
    const game = gamesService.getGame(request.params.id);
    const result = game.buyProperty();
    io.to(game.id).emit('propertyBought', result);
    return result;
  }
);
```

**Pros:**
- **Performance**: Fastest Node.js framework
- **Schema validation**: Built-in with JSON Schema
- **TypeScript support**: Good typing
- **Plugin system**: Extensible

**Cons:**
- **Smaller ecosystem**: Fewer plugins than Express
- **No DI**: Manual dependency management
- **No decorators**: Less declarative than NestJS
- **WebSocket**: Need manual setup
- **Less structure**: Similar to Express

## Decision

**Chosen: Angular + NestJS**

### Rationale

#### 1. **Unified Architecture Pattern**

Both frameworks use **Dependency Injection** and **Decorators**:

```typescript
// Frontend - Angular
@Injectable({ providedIn: 'root' })
export class GameService {
  constructor(private http: HttpClient) {}
}

// Backend - NestJS
@Injectable()
export class GamesService {
  constructor(private readonly playersService: PlayersService) {}
}
```

This creates a **consistent mental model** across the stack.

#### 2. **TypeScript-First Approach**

Both frameworks are built with TypeScript from the ground up:

```typescript
// Shared types
export interface IPlayer {
  id: string;
  name: string;
  money: number;
  position: number;
}

// Used in backend
class Player implements IPlayer { /* ... */ }

// Used in frontend
@Component({ /* ... */ })
export class PlayerInfoComponent {
  @Input() player!: IPlayer; // Type safety
}
```

#### 3. **Shared Types Between Frontend and Backend**

Thanks to the monorepo structure (ADR-001), we can share types:

```typescript
// Frontend imports backend types
import { Player } from '$server/modules/game/models/GameModels/player';
import { PropertyCell } from '$server/modules/game/models/FieldModels/cells';

// Full type safety across the stack
```

This is **much harder** to achieve with different languages or less structured frameworks.

#### 4. **WebSocket Support**

Both frameworks have excellent WebSocket support:

```typescript
// Backend - NestJS Gateway
@WebSocketGateway()
export class GameGateway {
  @SubscribeMessage('nextTurn')
  handleNextTurn(@MessageBody() data: any) { /* ... */ }
}

// Frontend - Angular Service
export class GameService {
  constructor() {
    this.socket.on('turnResult', (result) => {
      this.turnResult$.next(result);
    });
  }
}
```

#### 5. **RxJS Integration**

Angular uses RxJS extensively, and NestJS supports it:

```typescript
// Backend
@Get('games')
findAll(): Observable<Game[]> {
  return this.gamesService.findAll();
}

// Frontend
this.gameService.Game$.pipe(
  filter(game => game !== null),
  map(game => game.players)
).subscribe(players => { /* ... */ });
```

Reactive programming on both frontend and backend.

#### 6. **Testing Infrastructure**

Both frameworks have built-in testing support:

```typescript
// Backend - NestJS
describe('GamesService', () => {
  let service: GamesService;
  
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [GamesService],
    }).compile();
    
    service = module.get<GamesService>(GamesService);
  });
  
  it('should create a game', () => { /* ... */ });
});

// Frontend - Angular
describe('GameService', () => {
  let service: GameService;
  
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameService);
  });
  
  it('should connect to WebSocket', () => { /* ... */ });
});
```

Same testing patterns with Jasmine/Jest.

#### 7. **Enterprise-Ready Architecture**

Both frameworks enforce a **modular, scalable structure**:

```
comersant/
├── src/
│   ├── modules/
│   │   ├── game/
│   │   │   ├── game.module.ts
│   │   │   ├── game.controller.ts
│   │   │   ├── game.service.ts
│   │   │   └── game.gateway.ts
│   │   └── players/
│   └── app.module.ts
```

```
comersant-frontend/
├── src/
│   ├── app/
│   │   ├── game/
│   │   │   ├── game.component.ts
│   │   │   ├── game.service.ts
│   │   │   └── game.module.ts
│   │   └── players/
│   └── main.ts
```

Similar structure makes navigation easier.

## Consequences

### Positive

✅ **Unified architecture**: Same patterns (DI, decorators, modules) on frontend and backend  
✅ **Type safety**: TypeScript everywhere, shared types  
✅ **Developer experience**: One mental model to learn  
✅ **Scalability**: Both frameworks scale well for complex apps  
✅ **Tooling**: Excellent IDE support (IntelliSense, refactoring)  
✅ **Testing**: Built-in testing utilities  
✅ **WebSocket**: First-class support on both sides  
✅ **RxJS**: Reactive programming across the stack  
✅ **Documentation**: Both frameworks have excellent docs  
✅ **Long-term support**: Both backed by large communities

### Negative

❌ **Learning curve**: Steeper than simpler alternatives (Express + React)  
❌ **Boilerplate**: More code for simple features  
❌ **Bundle size**: Angular is heavier than React/Vue (mitigated with standalone components in Angular 14+)  
❌ **Opinionated**: Less flexibility than Express/React (though this can be a pro for consistency)  
❌ **Contributions**: Fewer developers know Angular compared to React (though NestJS is growing)

### Risks

⚠️ **Framework lock-in**: Hard to migrate away from Angular/NestJS  
**Mitigation**: Both frameworks are mature and actively maintained. Angular is backed by Google, NestJS has strong community support.

⚠️ **Frontend is harder to replace**: Complex SVG components with inheritance, reactive state management, Angular-specific features (new control flow syntax `@if`/`@for`, DI), and tightly coupled architecture make frontend migration expensive  
**Backend is easier to replace**: Standard REST/WebSocket API contract, game logic is decoupled from framework specifics  
**Mitigation**: Accept that frontend replacement would be a major undertaking (months of rewriting). Backend could be ported to Express/Fastify in weeks if needed.

⚠️ **Performance concerns**: Angular is heavier than alternatives  
**Mitigation**: Use standalone components, lazy loading, and AOT compilation. For a turn-based game, bundle size is acceptable.

⚠️ **Smaller talent pool for Angular**  
**Mitigation**: NestJS is TypeScript-based and familiar to Node.js developers. Angular developers are experienced with complex apps.

## Alternatives Considered and Rejected

### React + Express
**Why rejected**: No unified architecture, no DI, no shared patterns. Would require more boilerplate to achieve type safety and code organization.

### Vue + Fastify
**Why rejected**: Less mature ecosystem, no DI on backend, smaller community.

### Svelte + Koa
**Why rejected**: Svelte is still maturing, Koa is minimal and requires more setup, no DI.

## Notes

- This decision was made at the start of the project (November 2023) when:
  - Angular 17.0.0 was released (November 8, 2023) with standalone components as stable
  - NestJS 10.x was stable and mature
  - TypeScript 5.x was available
- **Current statistics (November 2025)**:
  - Angular: ~4.2M weekly downloads
  - React: ~50M weekly downloads  
  - NestJS: ~5.6M weekly downloads
  - Despite React's larger ecosystem, Angular + NestJS provides unified architecture worth the trade-off
- The combination provides excellent type safety and code sharing in a monorepo (see ADR-001)
- WebSocket support was a critical requirement, making this stack ideal

## Related ADRs

- [ADR-001: Monorepo Structure](./ADR-001-monorepo-structure.md) — Enables shared types
- [ADR-002: Frontend State Management via BehaviorSubject](./ADR-002-frontend-state-management.md) — Leverages RxJS from Angular
- [ADR-003: Server-Authoritative Game Engine](./ADR-003-server-authoritative-game-engine.md) — NestJS hosts the game logic
