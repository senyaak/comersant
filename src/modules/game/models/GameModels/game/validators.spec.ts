import { InvalidGameStateError, NotActivePlayerError } from '../errors';
import { GameStateType, StateManager } from '../state-manager';
import { RequireGameState, ValidateActivePlayer } from './validators';

const wrapValidateActivePlayer = <T extends unknown[], R>(
  fn: (playerId: string, ...args: T) => R,
) => {
  const descriptor = {
    value: fn,
    writable: true,
    enumerable: false,
    configurable: true,
  };
  ValidateActivePlayer({}, 'test', descriptor);
  return descriptor.value as (playerId: string, ...args: T) => R;
};

const wrapRequireGameState = (state: GameStateType, fn: (...args: unknown[]) => unknown) => {
  const descriptor: PropertyDescriptor = {
    value: fn,
    writable: true,
    enumerable: false,
    configurable: true,
  };
  RequireGameState(state)({}, 'test', descriptor);
  return descriptor.value as (...args: unknown[]) => unknown;
};

describe('@ValidateActivePlayer', () => {
  it('invokes the original method when the player id matches the current player', () => {
    const original = jest.fn().mockReturnValue('ok');
    const wrapped = wrapValidateActivePlayer(original);

    const fakeGame = { isPlayerActive: (id: string) => id === 'p1' };
    const result = wrapped.call(fakeGame as never, 'p1');

    expect(result).toBe('ok');
    expect(original).toHaveBeenCalledWith('p1');
  });

  it('throws NotActivePlayerError carrying the offending player id', () => {
    const original = jest.fn();
    const wrapped = wrapValidateActivePlayer(original);

    const fakeGame = { isPlayerActive: () => false };

    expect(() => wrapped.call(fakeGame as never, 'p2')).toThrow(NotActivePlayerError);
    try {
      wrapped.call(fakeGame as never, 'p2');
    } catch (e) {
      expect(e).toBeInstanceOf(NotActivePlayerError);
      expect((e as NotActivePlayerError).playerId).toBe('p2');
    }
    expect(original).not.toHaveBeenCalled();
  });

  it('forwards remaining arguments to the wrapped method unchanged', () => {
    const original = jest.fn();
    const wrapped = wrapValidateActivePlayer(original);

    const fakeGame = { isPlayerActive: () => true };
    wrapped.call(fakeGame as never, 'p1', 7, { foo: 'bar' });

    expect(original).toHaveBeenCalledWith('p1', 7, { foo: 'bar' });
  });
});

describe('@RequireGameState', () => {
  it('invokes the original method when stateManager is in the required state', () => {
    const original = jest.fn().mockReturnValue('done');
    const wrapped = wrapRequireGameState(GameStateType.Active, original);

    const stateManager = new StateManager();
    const result = wrapped.call({ stateManager } as never, 'arg');

    expect(result).toBe('done');
    expect(original).toHaveBeenCalledWith('arg');
  });

  it('throws InvalidGameStateError when stateManager is in any other state', () => {
    const original = jest.fn();
    const wrapped = wrapRequireGameState(GameStateType.WaitingForPropertyAction, original);
    const stateManager = new StateManager();

    expect(() => wrapped.call({ stateManager } as never)).toThrow(InvalidGameStateError);
    expect(original).not.toHaveBeenCalled();
  });

  it('InvalidGameStateError carries both the required and the actual state', () => {
    const wrapped = wrapRequireGameState(GameStateType.WaitingForTrade, jest.fn());
    const stateManager = new StateManager();

    try {
      wrapped.call({ stateManager } as never);
      fail('expected InvalidGameStateError to be thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(InvalidGameStateError);
      expect((e as InvalidGameStateError).requiredState).toBe(GameStateType.WaitingForTrade);
      expect((e as InvalidGameStateError).currentState).toBe(GameStateType.Active);
    }
  });

  it('preserves the return value of the original method', () => {
    const original = jest.fn().mockReturnValue({ some: 'payload' });
    const wrapped = wrapRequireGameState(GameStateType.Active, original);

    const result = wrapped.call({ stateManager: new StateManager() } as never);

    expect(result).toEqual({ some: 'payload' });
  });

  it('forwards multiple arguments to the wrapped method unchanged', () => {
    const original = jest.fn();
    const wrapped = wrapRequireGameState(GameStateType.Active, original);

    wrapped.call({ stateManager: new StateManager() } as never, 1, 'two', { three: 3 });

    expect(original).toHaveBeenCalledWith(1, 'two', { three: 3 });
  });
});

describe('@RequireGameState + @ValidateActivePlayer composition', () => {
  const wrapBoth = <T extends unknown[], R>(
    state: GameStateType,
    fn: (playerId: string, ...args: T) => R,
  ) => {
    const descriptor: PropertyDescriptor = {
      value: fn,
      writable: true,
      enumerable: false,
      configurable: true,
    };
    // Apply in the same order TypeScript applies stacked decorators in Game.ts:
    //   @RequireGameState(...)
    //   @ValidateActivePlayer
    //   method()
    // Decorators run bottom-up: ValidateActivePlayer wraps first, then RequireGameState.
    ValidateActivePlayer({}, 'test', descriptor as never);
    RequireGameState(state)({}, 'test', descriptor);
    return descriptor.value as (playerId: string, ...args: T) => R;
  };

  it('invokes the original only when both state and active player checks pass', () => {
    const original = jest.fn().mockReturnValue('ok');
    const wrapped = wrapBoth(GameStateType.Active, original);

    const context = {
      stateManager: new StateManager(),
      isPlayerActive: (id: string) => id === 'p1',
    };
    const result = wrapped.call(context as never, 'p1');

    expect(result).toBe('ok');
    expect(original).toHaveBeenCalledWith('p1');
  });

  it('state check runs first: throws InvalidGameStateError even if player would be active', () => {
    const original = jest.fn();
    const wrapped = wrapBoth(GameStateType.WaitingForTrade, original);

    const context = {
      stateManager: new StateManager(),
      isPlayerActive: () => true,
    };
    expect(() => wrapped.call(context as never, 'p1')).toThrow(InvalidGameStateError);
    expect(original).not.toHaveBeenCalled();
  });

  it('throws NotActivePlayerError when state is valid but player is wrong', () => {
    const original = jest.fn();
    const wrapped = wrapBoth(GameStateType.Active, original);

    const context = {
      stateManager: new StateManager(),
      isPlayerActive: () => false,
    };
    expect(() => wrapped.call(context as never, 'wrong')).toThrow(NotActivePlayerError);
    expect(original).not.toHaveBeenCalled();
  });
});
