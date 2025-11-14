# 🎮 Comersant

> **Multiplayer board game in the Monopoly style**

Comersant is a web-based multiplayer board game platform built with Angular and NestJS. Players compete to acquire properties, build businesses, and bankrupt opponents in an economic simulation.

## 🌟 Features

- 🎯 **Multiplayer** gameplay via WebSocket
- 🎲 **Turn-based mechanics** with dice rolls
- 👥 **Room management** - create and join game sessions
- 🎨 **Interactive SVG board** with smooth animations
- 🔒 **Server-authoritative** game engine preventing cheating
- 🏗️ **Monorepo architecture** with shared TypeScript types
- 📚 **Comprehensive documentation** with C4 diagrams and ADRs

## 🏗️ Architecture

This project uses a **monorepo structure** with:

- **Backend**: NestJS + Socket.IO + TypeScript
- **Frontend**: Angular + Socket.IO Client + TypeScript
- **Shared**: Common types and models between client and server

```
comersant/
├── src/                       # Backend (NestJS)
│   ├── modules/
│   │   ├── game/              # Game logic & WebSocket gateway
│   │   └── lobby/             # Room management
│   └── main.ts
├── comersant-frontend/        # Frontend (Angular)
│   └── src/app/
│       ├── modules/
│       │   ├── game/          # Game UI components
│       │   └── lobby/         # Lobby UI
│       └── services/
├── docs/                      # Architecture documentation
│   ├── architecture/          # C4 diagrams
│   └── adr/                   # Architecture Decision Records
└── documentation/             # Generated API docs
```

See [ADR-001](./docs/adr/ADR-001-monorepo-structure.md) for monorepo rationale.

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 24.11.0
- **npm** >= 11.6.0

### Installation

```bash
# Clone the repository
git clone https://github.com/senyaak/comersant.git
cd comersant

# Install backend dependencies
npm install

# Install frontend dependencies
cd comersant-frontend
npm install
cd ..
```

### Development

Run backend and frontend concurrently in separate terminals:

```bash
# Terminal 1 - Backend (http://localhost:3000)
npm run start:dev

# Terminal 2 - Frontend (BE ships via static serving)
cd comersant-frontend
npm run start:dev
```

The game will be available at `http://localhost:3000`

Note: The FE builds in dist and the server ships it with static serving.

### Production Build

```bash
# Build frontend
cd comersant-frontend
npm run build
cd ..

# Build backend
npm run build

# Start production server
npm run start:prod
```

The backend serves the built frontend at `http://localhost:3000`

## 📖 Documentation

### User Documentation

- **How to play**: [Game Rules 🇷🇺](./docs/gamerulez_ru.md) | [Game Rules 🇬🇧](./docs/gamerulez_en.md)
- **API Documentation**: [Auto-generated](#generate-documentation) at `http://localhost:3000/docs`

### Developer Documentation

- **Architecture**: [C4 Diagrams](./docs/architecture/)
  - [Level 1 - Context Diagram](./docs/architecture/01-context.md)
  - [Level 2 - Container Diagram](./docs/architecture/02-container.md)
  - [Level 3 - Components-BE](./docs/architecture/03-component-backend.md)
  - [Level 3 - Components-FE](./docs/architecture/03-component-frontend.md)
  - [Level 4 - Sequence Diagram](./docs/architecture/04-sequence-game-flow.md)
  
- **ADRs** (Architecture Decision Records): [./docs/adr/](./docs/adr/)
  - [ADR-001: Monorepo Structure](./docs/adr/ADR-001-monorepo-structure.md)
  - [ADR-002: Frontend State Management](./docs/adr/ADR-002-frontend-state-management.md)
  - [ADR-003: Server-Authoritative Game Engine](./docs/adr/ADR-003-server-authoritative-game-engine.md)
  - [ADR-004: Angular + NestJS Stack](./docs/adr/ADR-004-angular-nestjs-technology-stack.md)

### Generate Documentation

```bash
# Generate all documentation (TypeDoc + Compodoc + Architecture)
npm run docs:build

# Generate backend API docs (TypeDoc)
npm run docs:backend

# Generate frontend component docs (Compodoc)
npm run docs:frontend

# Generate architecture diagrams
npm run docs:architecture

# Generate ADR index
npm run docs:adr

# Serve documentation
npm run compodoc:serve
```

## 🧪 Testing(WIP)

```bash
# Backend unit tests
npm run test

# Backend e2e tests
npm run test:e2e

# Backend test coverage
npm run test:cov

# Frontend unit tests
cd comersant-frontend
npm run test
```

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Angular 20 | SPA framework |
| **Frontend UI** | SVG + SCSS | Interactive game board |
| **Frontend State** | RxJS BehaviorSubject | Reactive state management |
| **Backend** | NestJS 11 | Server framework |
| **Real-time** | Socket.IO | WebSocket communication |
| **Language** | TypeScript 5.8 | Type safety |
| **Testing** | Jest + Jasmine | Unit & E2E tests |
| **Docs** | TypeDoc + Compodoc | API documentation |
| **Linting** | ESLint 9 | Code quality |
| **Build** | Angular CLI + NestJS CLI | Development tooling |

## 📝 Scripts Reference

### Backend Scripts

```bash
npm run start              # Start backend
npm run start:dev          # Start with hot-reload
npm run start:debug        # Start with debugger
npm run start:prod         # Production mode
npm run build              # Build backend
npm run lint               # Lint TypeScript files
npm run format             # Format with Prettier
```

### Frontend Scripts

```bash
cd comersant-frontend
npm start                  # Development server
npm run build              # Production build
npm run watch              # Build with file watching
npm run test               # Run unit tests
npm run lint               # Lint Angular app
```

### Documentation Scripts

```bash
npm run docs:build         # Generate all docs
npm run docs:backend       # TypeDoc for backend
npm run docs:frontend      # Compodoc for frontend
npm run docs:architecture  # Build C4 diagrams
npm run docs:adr           # Generate ADR index
npm run compodoc:serve     # Serve docs locally
```

## 🏛️ Project Structure

```
comersant/
├── src/                         # Backend source
│   ├── modules/
│   │   ├── game/
│   │   │   ├── controllers/     # HTTP controllers
│   │   │   ├── gateways/        # WebSocket gateways
│   │   │   ├── models/          # Game logic
│   │   │   │   ├── FieldModels/ # Board, Cells, Cards
│   │   │   │   └── GameModels/  # Game, Player, Properties
│   │   │   └── services/        # Game services
│   │   └── lobby/               # Room management
│   ├── static/                  # Served frontend build/documentation
│   └── main.ts                  # Entry point
├── comersant-frontend/          # Frontend source
│   └── src/
│       ├── app/
│       │   ├── modules/
│       │   │   ├── game/
│       │   │   │   ├── components/
│       │   │   │   │   └── main/
│       │   │   │   │       ├── board/    # Game board
│       │   │   │   │       │   ├── cell/ # Cell components
│       │   │   │   │       │   └── pawn/ # Player pawns
│       │   │   │   │       └── ui/       # Game controls
│       │   │   │   └── services/         # Game services
│       │   │   └── lobby/                # Lobby UI
│       │   └── services/                 # Shared services
│       └── assets/                       # Static assets
├── docs/                                 # Documentation
│   ├── architecture/                     # C4 diagrams
│   └── adr/                              # ADRs
├── scripts/                              # Build scripts
└── test/                                 # E2E tests
```

## 🔧 Configuration

### TypeScript Path Aliases

Frontend can import backend types directly:

```typescript
// In Angular components
import { Player } from '$server/modules/game/models/GameModels/player';
import { Board } from '$server/modules/game/models/FieldModels/board';
import { PropertyCell } from '$server/modules/game/models/FieldModels/cells';
```

Configured in `comersant-frontend/tsconfig.json`:

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

### ESLint

Shared ESLint configuration hardlinked between frontend and backend:
- Root: `eslint.config.mjs`
- Frontend: `comersant-frontend/eslint.config.mjs` (hardlink)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) *(coming soon)* for details.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**[senyaak](https://github.com/senyaak)**

**Built with ❤️ using TypeScript**

**README powered by Copilot (Claude Sonnet 4.5)**