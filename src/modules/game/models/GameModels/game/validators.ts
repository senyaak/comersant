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
      throw new Error(`It's not player ${playerId} turn`);
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
        const currentState = this.stateManager.state;
        throw new Error(
          `Action not allowed in current game state. Required: ${requiredState}, Current: ${currentState}`,
        );
      }
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
