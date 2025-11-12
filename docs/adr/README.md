# Architecture Decision Records (ADR)

This directory contains Architecture Decision Records for the Comersant project.

## What is an ADR?

An ADR is a document that captures an important architectural decision along with its context and consequences. Each ADR describes:

- **Context**: the problem or question that required a decision
- **Options Considered**: what alternatives were evaluated
- **Decision**: what was chosen and why
- **Consequences**: the pros and cons of the chosen solution

## ADR List

| ID | Title | Status | Date |
|----|-------|--------|------|
| [ADR-001](./ADR-001-monorepo-structure.md) | Monorepo for Frontend and Backend | Accepted | 2025-11-12 |
| [ADR-002](./ADR-002-frontend-state-management.md) | Frontend State Management via BehaviorSubject | Accepted | 2025-11-12 |
| [ADR-003](./ADR-003-server-authoritative-game-engine.md) | Centralized Game Engine on Backend | Accepted | 2025-11-12 |
| [ADR-004](./ADR-004-angular-nestjs-technology-stack.md) | Angular + NestJS Technology Stack | Accepted | 2025-11-12 |

## ADR Format

Each ADR follows this structure:

```markdown
# ADR-XXX: Brief Title

**Status:** [Proposed / Accepted / Rejected / Deprecated]  
**Date:** YYYY-MM-DD  
**Author:** Author Name

## Context

Description of the problem or situation requiring a decision.

## Options Considered

### Option 1: Name
- Pros
- Cons

### Option 2: Name
- Pros
- Cons

## Decision

Chosen option and rationale.

## Consequences

### Positive
- What improves

### Negative
- What we have to live with

### Risks
- Potential issues

## Notes
Additional information, links to related ADRs or external resources.
```

## ADR Creation Process

1. Create a new file `ADR-XXX-brief-title.md`
2. Use the next available number
3. Fill in all template sections
4. Add a link to the table above
5. Create a Pull Request for discussion (if needed)

## References

- [ADR on GitHub](https://adr.github.io/)
- [Architecture Decision Records (Michael Nygard)](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
