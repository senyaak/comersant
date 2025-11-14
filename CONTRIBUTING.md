# Contributing to Comersant 🎮

First off, thank you for considering contributing to Comersant! It's people like you that make this project better.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code. Please be respectful and constructive in all interactions.

## Getting Started

### Prerequisites

- **Node.js** >= 24.11.0
- **npm** >= 11.6.0
- **Git**

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:

```bash
git clone https://github.com/YOUR_USERNAME/comersant.git
cd comersant
```

3. Add the upstream repository:

```bash
git remote add upstream https://github.com/senyaak/comersant.git
```

### Installation

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd comersant-frontend
npm install
cd ..
```

## Development Workflow

### 1. Create a Feature Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test updates
- `chore/` - Maintenance tasks

### 2. Make Your Changes

- Write clean, readable code
- Follow the [Coding Standards](#coding-standards)
- Add tests for new features
- Update documentation as needed
- Keep commits focused and atomic

### 3. Test Your Changes

```bash
# Backend tests
npm run test

# Frontend tests
cd comersant-frontend
npm run test
cd ..

# Lint your code
npm run lint
cd comersant-frontend
npm run lint
cd ..
```

### 4. Commit Your Changes

Write clear, concise commit messages:

```bash
git commit -m "feat: add player inventory system"
git commit -m "fix: resolve dice roll synchronization issue"
git commit -m "docs: update API documentation"
```

Commit message format:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style/formatting
- `refactor:` - Code refactoring
- `test:` - Test updates
- `chore:` - Maintenance

### 5. Keep Your Branch Updated

```bash
git fetch upstream
git rebase upstream/master
```

## Pull Request Process

### Before Submitting

- [ ] Tests pass (`npm run test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Documentation is updated
- [ ] Code follows project style
- [ ] Commits are clean and well-described

### Submitting a Pull Request

1. Push your branch to your fork:

```bash
git push origin feature/your-feature-name
```

2. Go to GitHub and create a Pull Request
3. Fill out the PR template completely
4. Link any related issues
5. Wait for review and address feedback

### Review Process

- PRs require at least one approval
- All CI checks must pass
- Address reviewer feedback promptly
- Keep discussions constructive and professional

## Coding Standards

All code style rules are defined and enforced by ESLint configuration.

See: [`eslint.config.mjs`](./eslint.config.mjs)

To check your code:
```bash
npm run lint
```

## Project Structure

### Monorepo Architecture

```
comersant/
├── src/                    # Backend (NestJS)
├── comersant-frontend/     # Frontend (Angular)
└── docs/                   # Documentation
```


## Testing

### Unit Tests

```bash
# Backend
npm run test

# Frontend
cd comersant-frontend
npm run test
```

### E2E Tests

```bash
npm run test:e2e
```

### Test Coverage

```bash
npm run test:cov
```

### Writing Tests

- Test files: `*.spec.ts`
- Coverage target: 80%+
- Test edge cases
- Mock external dependencies

```typescript
describe('GameService', () => {
  it('should create a new game', () => {
    // Arrange
    const service = new GameService();

    // Act
    const game = service.createGame();

    // Assert
    expect(game).toBeDefined();
  });
});
```

## Documentation

### Code Documentation

Use JSDoc/TSDoc comments(but try to keep the code self-explanatory):

```typescript
/**
 * Rolls dice and returns the sum
 * @param count Number of dice to roll
 * @returns Sum of all dice rolls
 */
function rollDice(count: number): number {
  // Implementation
}
```

### Architecture Decisions

For significant changes:
1. Create an ADR in `docs/adr/`

## Questions?

- Check existing [documentation](./docs/)
- Read [Architecture Decision Records](./docs/adr/)
- Open a [discussion](https://github.com/senyaak/comersant/discussions)
- Ask in issues or PR comments

## Thank You! 🙏

Your contributions make this project better for everyone!

---

**Happy Coding!** 🎲
