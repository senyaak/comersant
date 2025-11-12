# ADR-001: Monorepo for Frontend and Backend

**Status:** Accepted  
**Date:** 2025-11-12  
**Author:** senyaak

## Context

The Comersant project consists of two main parts:
- **Backend**: NestJS application with WebSocket support, game logic, and API
- **Frontend**: Angular SPA with Socket.IO client

The question arose: should both parts be kept in one repository (monorepo) or split into separate repositories?

Key requirements:
- Need to share TypeScript types between frontend and backend
- Synchronization of data model versions (Player, Board, Cell, Property, etc.)
- Simplified development with frequent changes to API and models
- Unified documentation system for the entire project

## Options Considered

### Option 1: Monorepo (chosen)

**Pros:**
- **Code sharing**: Types and models are used directly via TypeScript path aliases (`$server/*`, `$types/*`)
- **Atomic changes**: API and data contract changes happen in a single commit
- **Unified CI/CD**: One pipeline for testing, building, and deployment
- **Simplified development**: No need to synchronize versions between repositories
- **Unified documentation**: All ADRs, architectural diagrams, and documentation in one place

**Cons:**
- More complex project structure
- All parts coupled at filesystem level 

### Option 2: Separate repositories

**Pros:**
- Clear separation of concerns
- Independent CI/CD pipelines
- Easier access rights setup for different teams
- Smaller size of each repository

**Cons:**
- **Type duplication**: Need an npm package with shared types or code copying
- **Version synchronization**: When API changes, both repos need updates
- **Development complexity**: Two PRs, two CIs, two branches for one feature
- **Risk of desynchronization**: Frontend and backend may have incompatible versions
- **Distributed documentation**: ADRs and architecture scattered across different places

### Option 3: Nx workspace

**Pros:**
- All benefits of monorepo
- Additional tooling (code generation, dependency graph)
- Build caching
- Support for micro-frontends and microservices

**Cons:**
- Excessive complexity for current project size
- Additional dependency (Nx)
- Time required to learn Nx
- Overhead for a small project

## Decision

**Chosen: Option 1 - Monorepo without Nx**

### Rationale:

1. **Shared types are critical**: Game models (Player, Board, Cell, Property) are used on both frontend and backend. Keeping them synchronized in separate repos is a source of bugs.

2. **Rapid development**: When developing new features, both API and UI often change simultaneously. Monorepo allows doing this atomically.

3. **TypeScript path aliases solve imports**: 
   ```typescript
   // Frontend can import server types
   import { Player } from '$server/modules/game/models/GameModels/player';
   import { PropertyCell } from '$server/modules/game/models/FieldModels/cells';
   ```

4. **Project size doesn't require Nx**: Two applications in a monorepo is not the complexity that requires tools like Nx.

5. **Unified documentation**: Architectural decisions, C4 diagrams, TypeDoc and Compodoc live together.

### Monorepo structure:

```
comersant/
├── src/                    # Backend (NestJS)
│   ├── modules/
│   │   ├── lobby/
│   │   └── game/
│   └── main.ts
├── comersant-frontend/     # Frontend (Angular)
│   ├── src/
│   │   └── app/
│   └── angular.json
├── docs/                   # Shared documentation
│   ├── architecture/       # C4 diagrams
│   └── adr/               # ADRs
├── documentation/          # Generated TypeDoc
├── scripts/               # Shared scripts
└── package.json           # Backend deps
```

## Consequences

### Positive

✅ **Type safety**: TypeScript compiler checks frontend-backend compatibility  
✅ **Fast development**: No need to switch between repositories  
✅ **Atomic commits**: API and UI changes in a single commit  
✅ **Single source of truth**: Data models in one place  
✅ **Simplified CI**: One GitHub Actions workflow  
✅ **Shared scripts**: `docs:build`, `docs:architecture` for the entire project  
✅ **Unified code style**: `eslint.config.mjs` is hardlinked between frontend and backend, ensuring identical linting rules

### Negative

❌ **Coupling**: Frontend and backend are linked at filesystem level  
❌ **Git history**: Commits mix frontend and backend changes  
❌ **Repository size**: Larger than if it were a single project

### Versioning

**No explicit versioning needed**: TypeScript compiler enforces synchronization. If backend changes a type, frontend immediately gets compilation errors. This is the main benefit of monorepo — automatic type safety.

### Risks

⚠️ **Scaling**: If project grows to 5+ applications, consider Nx or microservices. Not relevant yet.

**Note**: Frontend imports shared models (`IGame`, `Player`, `Board`) by design, not accidentally. These models are platform-agnostic and work in both browser and Node.js. Server-only classes (e.g., `Game` with decorators and crypto) are not imported by frontend.

## Future Alternatives

If the project grows:
- Migrate to **Nx workspace** or **Turborepo** for better dependency management
- Extract **shared library** (`@comersant/common`) as npm package
- Split into **microservices** (auth service, game service) within monorepo

## Notes

- TypeScript path aliases are configured in `tsconfig.json` and `angular.json`:
  ```json
  {
    "paths": {
      "$server/*": ["../src/*"],
      "$types/*": ["../src/types/*"]
    }
  }
  ```

- ESLint configuration is hardlinked: `comersant-frontend/eslint.config.mjs` points to the same file as root `eslint.config.mjs`, ensuring identical code style rules across frontend and backend

- Backend serves frontend via `@nestjs/serve-static`: built Angular app is served directly from NestJS, simplifying deployment to a single process

## Related ADRs

- [ADR-007: TypeScript path aliases](./ADR-007-typescript-path-aliases.md) — details about import configuration
