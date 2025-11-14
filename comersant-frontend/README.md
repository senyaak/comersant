# Comersant Frontend

> **Angular SPA for the Comersant multiplayer board game**

This is the frontend application for Comersant - a real-time multiplayer board game built with Angular and Socket.IO.

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 24.11.0
- **npm** >= 11.6.0
- Backend server running on `http://localhost:3000`

### Development Server

```bash
# Start backend (serves frontend at http://localhost:3000) then here:
npm install
npm run start:dev
```

Navigate to `http://localhost:3000/`.

### Production Build

```bash
npm run build
```

Build artifacts will be stored in the `dist/` directory. The backend serves this build.

## 📁 Project Structure

```
src/
├── app/
│   ├── modules/
│   │   ├── game/                             # Game module
│   │   │   ├── components/
│   │   │   │   └── main/
│   │   │   │       ├── board/                # Game board components
│   │   │   │       │   ├── cell/             # Individual cell types
│   │   │   │       │   │   ├── abstract/     # Base classes
│   │   │   │       │   │   ├── area/         # Site cells
│   │   │   │       │   │   ├── card/         # Event card cells
│   │   │   │       │   │   ├── property/     # Property cells
│   │   │   │       │   │   └── static/       # Special cells
│   │   │   │       │   ├── pawn/             # Player pawns
│   │   │   │       │   └── board.component.ts
│   │   │   │       └── ui/                   # Game controls
│   │   │   │           ├── control-actions/
│   │   │   │           ├── game-control/
│   │   │   │           ├── game-info/
│   │   │   │           └── player-info/
│   │   │   ├── services/                     # Game services
│   │   │   │   ├── game.service.ts
│   │   │   │   ├── game-state.service.ts
│   │   │   │   ├── game-events.service.ts
│   │   │   │   └── game-notification.service.ts
│   │   │   └── game.module.ts
│   │   └── lobby/                            # Lobby module
│   │       ├── components/
│   │       │   ├── create-room/
│   │       │   └── enter-center/
│   │       ├── services/
│   │       │   └── lobby.service.ts
│   │       └── lobby.module.ts
│   ├── services/                             # Shared services
│   │   ├── user-settings.service.ts
│   ├── app.component.ts
│   └── app.module.ts
├── assets/                                   # Static assets
│   └── i18n/                                 # Translations
└── styles.scss                               # Global styles
```

## 🏗️ Architecture

### Modules

- **AppModule**: Root module with routing
- **LobbyModule**: Room creation and joining
- **GameModule**: Main game interface and mechanics

### State Management

Uses **RxJS BehaviorSubjects** for event-driven reactive state:

See [ADR-002](../docs/adr/ADR-002-frontend-state-management.md) for rationale.

### Backend Communication

WebSocket events via Socket.IO:

```typescript
// Emit events
socket.emit('nextTurn', { diceCounter: 1 });
socket.emit('buyProperty');

// Listen for events
socket.on('turnResult', (result) => { /* ... */ });
socket.on('propertyBought', (data) => { /* ... */ });
socket.on('gameState', (game) => { /* ... */ });
```

### Shared Types

Frontend imports backend types directly from monorepo:

```typescript
import { Player } from '$server/modules/game/models/GameModels/player';
import { Board } from '$server/modules/game/models/FieldModels/board';
import { PropertyCell } from '$server/modules/game/models/FieldModels/cells';
```

Configured via TypeScript path aliases in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "$server/*": ["../src/*"],
      "$types/*": ["../src/types/*"]
    }
  }
}
```

## 🧪 Testing(WIP)

```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test -- --code-coverage

# Run tests in headless mode
npm run test -- --browsers=ChromeHeadless --watch=false
```

## 📚 Documentation

### Generate Component Documentation

All documentation is generated in BE part see [Generate Documentation](./../README.md### Generate Documentation).

```bash
### View Architecture

See parent [README](../README.md) for:
- C4 architecture diagrams
- ADR (Architecture Decision Records)
- Full project documentation

## 🎨 Styling

- **SCSS** for component styles
- **SVG** for game board rendering
- **Angular animations** for smooth transitions
- **Responsive design** for different screen sizes

Global styles in `src/styles.scss`. Component-specific styles in `*.component.scss`.

## 🌐 Internationalization (i18n)

Extract translation strings:

```bash
npm run i18n:extract
```

Translation files are stored in `src/assets/i18n/`.

## 🔧 Code Scaffolding

Generate new components:

```bash
# Generate component
ng generate component modules/game/components/my-component

# Generate service
ng generate service modules/game/services/my-service

# Generate module
ng generate module modules/my-module
```

## 🛠️ Tech Stack

- **Angular** 20.3.7 - Framework
- **RxJS** 7.8.2 - Reactive programming
- **Socket.IO Client** 4.8.1 - WebSocket communication
- **TypeScript** 5.8.3 - Type safety
- **Jasmine** - Unit testing
- **Karma** - Test runner
- **ESLint** - Code linting
- **Compodoc** - Documentation generation

## 📝 Scripts

```bash
npm start                    # Start development server
npm run build                # Production build
npm run watch                # Build with file watching
npm run test                 # Run unit tests
npm run lint                 # Lint TypeScript files
npm run i18n:extract         # Extract translations
npm run compodoc:build       # Generate documentation
npm run compodoc:serve       # Serve documentation
```

## 🔗 Related Documentation

- [Main README](../README.md) - Full project documentation
- [ADR-001: Monorepo](../docs/adr/ADR-001-monorepo-structure.md) - Why frontend and backend are together
- [ADR-002: State Management](../docs/adr/ADR-002-frontend-state-management.md) - Why BehaviorSubject over NgRx
- [ADR-004: Tech Stack](../docs/adr/ADR-004-angular-nestjs-technology-stack.md) - Why Angular

## 🤝 Contributing

This is part of a monorepo. See the [main README](../README.md) for contribution guidelines.

## 📄 License

UNLICENSED

---

**Part of the Comersant game platform**
