# C4 Component Diagram - Backend Architecture

```mermaid
graph TB
    %% External
    SPA["📱 Angular SPA<br/>Game interface and lobby"]
    
    subgraph "🔧 NestJS Backend"
        %% Main App Layer
        AppModule["🏠 App Module<br/>NestJS Module<br/>Main application module"]
        AppController["🎛️ App Controller<br/>NestJS Controller<br/>Basic routes & health checks"]
        
        %% Lobby Module
        subgraph "🏢 Lobby Module"
            LobbyModule["🏢 Lobby Module<br/>NestJS Module"]
            RoomsController["🚪 Rooms Controller<br/>NestJS Controller<br/>REST endpoints for rooms"]
            LobbyGateway["⚡ Lobby Gateway<br/>WebSocket Gateway<br/>Join, create room events"]
        end
        
        %% Game Module  
        subgraph "🎮 Game Module"
            GameModule["🎮 Game Module<br/>NestJS Module"]
            GamesController["🎯 Games Controller<br/>NestJS Controller<br/>Game management REST"]
            GamesService["⚙️ Games Service<br/>NestJS Service<br/>Multiple game instances"]
            GameGateway["⚡ Game Gateway<br/>WebSocket Gateway<br/>Turns, moves, events"]
        end
        
        %% Game Logic
        subgraph "🧠 Game Logic"
            GameEngine["🎯 Game Engine<br/>TypeScript Class<br/>Core game logic & state"]
            GameModels["📋 Game Models<br/>TypeScript Classes<br/>Player, Board, Cell, Property"]
            GameUtils["🔧 Game Utilities<br/>TypeScript Functions<br/>Validation & helpers"]
        end
        
        StaticServer["📁 Static Server<br/>ServeStatic Module<br/>Docs & frontend assets"]
    end
    
    %% Relationships
    SPA -->|"GET /lobby<br/>HTTPS"| RoomsController
    SPA -->|"Game management<br/>HTTPS"| GamesController
    SPA -->|"Room events<br/>WebSocket /lobby"| LobbyGateway
    SPA -->|"Game events<br/>WebSocket /game"| GameGateway
    
    AppModule --> LobbyModule
    AppModule --> GameModule
    AppModule --> StaticServer
    
    LobbyModule --> RoomsController
    LobbyModule --> LobbyGateway
    RoomsController --> LobbyGateway
    
    GameModule --> GamesController
    GameModule --> GamesService
    GameModule --> GameGateway
    
    LobbyGateway -->|"creates games"| GamesService
    GameGateway -->|"manages games"| GamesService
    GamesService -->|"creates & manages"| GameEngine
    
    GameEngine --> GameModels
    GameGateway --> GameUtils
    
    %% Styling
    classDef external fill:#999999,stroke:#6b6b6b,stroke-width:2px,color:#ffffff
    classDef module fill:#1f77b4,stroke:#144870,stroke-width:2px,color:#ffffff
    classDef component fill:#85c1e9,stroke:#5dade2,stroke-width:2px,color:#000000
    classDef logic fill:#f39c12,stroke:#e67e22,stroke-width:2px,color:#ffffff
    
    class SPA external
    class AppModule,LobbyModule,GameModule,StaticServer module
    class AppController,RoomsController,LobbyGateway,GamesController,GamesService,GameGateway component
    class GameEngine,GameModels,GameUtils logic
```

**Core Game Mechanics:**
- **Turn management** with player validation
- **Property transactions** and ownership
- **Player movement** on game board
- **Event handling** for special cells

**Real-time Events:**
- `nextTurn` - Process player turn
- `buyProperty` - Handle property purchase
- `player_moved` - Sync player position