import { GameStateType } from './state-manager';

/** Base class for every domain error thrown from GameModels. */
export class GameError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

// ─── Validator errors ────────────────────────────────────────────────────────

export class NotActivePlayerError extends GameError {
  constructor(public readonly playerId: string) {
    super(`It's not player ${playerId} turn`);
  }
}

export class InvalidGameStateError extends GameError {
  constructor(
    public readonly requiredState: GameStateType,
    public readonly currentState: GameStateType,
  ) {
    super(
      `Action not allowed in current game state. Required: ${requiredState}, Current: ${currentState}`,
    );
  }
}

// ─── Player errors ───────────────────────────────────────────────────────────

export class InvalidPlayerConstructorArgumentError extends GameError {
  constructor() {
    super('Invalid Player constructor argument');
  }
}

export class PlayerFrozenError extends GameError {
  constructor() {
    super('Player is frozen and cannot move');
  }
}

export class RaccitoCounterActiveError extends GameError {
  constructor() {
    super('Cannot remove raccito while the counter is still active');
  }
}

// ─── Game lifecycle / setup errors ───────────────────────────────────────────

export class InsufficientPlayersError extends GameError {
  constructor() {
    super('At least two players are required to start a game');
  }
}

export class PlayerNotFoundError extends GameError {
  constructor(public readonly identifier: string) {
    super(`Player not found: ${identifier}`);
  }
}

export class InvalidTurnStateError extends GameError {
  constructor() {
    super('Invalid turn state or missing diceCounter');
  }
}

export class InvalidCellIndexError extends GameError {
  constructor(public readonly cellIndex: number) {
    super(`Invalid cell index: ${cellIndex}`);
  }
}

export class UnhandledEffectError extends GameError {
  constructor(public readonly effectType: string) {
    super(`Unhandled effect type: ${effectType}`);
  }
}

// ─── Property / trading errors ───────────────────────────────────────────────

export class NotAPropertyCellError extends GameError {
  constructor(public readonly propertyIndex?: number) {
    super(
      propertyIndex === undefined
        ? 'Current cell is not a property'
        : `Cell at index ${propertyIndex} is not a property`,
    );
  }
}

export class PropertyAlreadyOwnedError extends GameError {
  constructor(public readonly playerId: string) {
    super(`Property is already owned by player ${playerId}`);
  }
}

export class InsufficientFundsError extends GameError {
  constructor() {
    super('Insufficient funds');
  }
}

export class NoTradingEventError extends GameError {
  constructor() {
    super('No trading event in progress');
  }
}

// ─── Auction errors ──────────────────────────────────────────────────────────

export class AuctionNotStartedError extends GameError {
  constructor() {
    super('Auction not started yet. Use buyProperty or refuseFirstBuyOffer first');
  }
}

export class PlayerAlreadyPassedError extends GameError {
  constructor(public readonly playerIndex: number) {
    super(`Player ${playerIndex} has already passed on this auction`);
  }
}

export class NotInAuctionError extends GameError {
  constructor(public readonly playerIndex: number) {
    super(`Player ${playerIndex} cannot participate in this auction`);
  }
}

// ─── Card / event cell errors ────────────────────────────────────────────────

export class UnknownEventTypeError extends GameError {
  constructor(public readonly eventType: unknown) {
    super(`Unknown event type: ${String(eventType)}`);
  }
}

export class UnknownEventItemError extends GameError {
  constructor(public readonly item: unknown) {
    super(`Unknown event item: ${String(item)}`);
  }
}

export class UnknownEventCellTypeError extends GameError {
  constructor() {
    super('Unknown event cell type');
  }
}

export class UnknownStaticEventCellTypeError extends GameError {
  constructor(public readonly cellType: unknown) {
    super(`Unknown static event cell type: ${String(cellType)}`);
  }
}
