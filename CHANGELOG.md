# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Game rules documentation in Russian and English 📖
- Comprehensive README with project structure
- Architecture documentation (C4 diagrams)
- Architecture Decision Records (ADRs)
- TypeScript path aliases for shared types
- ESLint configuration with hardlinks
- Contributing guidelines
- MIT License

### Changed
- Monorepo structure with shared types between frontend and backend

### Documentation
- [Game Rules 🇷🇺](./docs/gamerulez_ru.md)
- [Game Rules 🇬🇧](./docs/gamerulez_en.md)
- [Architecture C4 Diagrams](./docs/architecture/)
- [ADR-001: Monorepo Structure](./docs/adr/ADR-001-monorepo-structure.md)
- [ADR-002: Frontend State Management](./docs/adr/ADR-002-frontend-state-management.md)
- [ADR-003: Server-Authoritative Game Engine](./docs/adr/ADR-003-server-authoritative-game-engine.md)
- [ADR-004: Angular + NestJS Stack](./docs/adr/ADR-004-angular-nestjs-technology-stack.md)

## [0.1.0] - Initial Development

### Added
- NestJS backend with WebSocket support
- Angular frontend with SVG game board
- Room/lobby management system
- Turn-based game mechanics
- Dice rolling system
- Property acquisition system
- Player management
- Real-time multiplayer via Socket.IO

### Tech Stack
- Backend: NestJS 11 + Socket.IO
- Frontend: Angular 20 + RxJS
- Language: TypeScript 5.8
- Testing: Jest + Jasmine
- Documentation: TypeDoc + Compodoc

---

## Changelog Conventions

### Types of Changes
- **Added** - New features
- **Changed** - Changes in existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Vulnerability fixes

### Version Format
- **Major** (x.0.0) - Breaking changes
- **Minor** (0.x.0) - New features, backwards compatible
- **Patch** (0.0.x) - Bug fixes, backwards compatible

[Unreleased]: https://github.com/senyaak/comersant/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/senyaak/comersant/releases/tag/v0.1.0
