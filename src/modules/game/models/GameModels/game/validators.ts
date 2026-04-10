import { InvalidGameStateError, NotActivePlayerError } from '../errors';
import { Game } from '../game';
import { GameStateType } from '../state-manager';

// Type constraint to ensure the method has playerId as first parameter
type MethodWithPlayerId<T extends unknown[], R> = (playerId: string, ...args: T) => R;

// Decorator to validate that the player is active
export function ValidateActivePlayer<T extends unknown[], R>(
  target: unknown,
  propertyKey: string,
  descriptor: TypedPropertyDescriptor<MethodWithPlayerId<T, R>>,
): TypedPropertyDescriptor<MethodWithPlayerId<T, R>> {
  const originalMethod = descriptor.value;

  descriptor.value = function(this: Game, playerId: string, ...args: T): R {
    if (!this.isPlayerActive(playerId)) {
      throw new NotActivePlayerError(playerId);
    }
    return originalMethod?.apply(this, [playerId, ...args]);
  };

  return descriptor;
}

// Decorator to require specific game state
export function RequireGameState(requiredState: GameStateType) {
  return function(
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;

    descriptor.value = function(this: Game, ...args: unknown[]): unknown {
      if (!this.stateManager.isStateValid(requiredState)) {
        throw new InvalidGameStateError(requiredState, this.stateManager.state);
      }
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
