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

  it('throws when the supplied player id is not the active one', () => {
    const original = jest.fn();
    const wrapped = wrapValidateActivePlayer(original);

    const fakeGame = { isPlayerActive: () => false };

    expect(() => wrapped.call(fakeGame as never, 'p2')).toThrow(/p2/);
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

  it('throws when stateManager is in any other state', () => {
    const original = jest.fn();
    const wrapped = wrapRequireGameState(GameStateType.WaitingForPropertyAction, original);

    const stateManager = new StateManager();

    expect(() => wrapped.call({ stateManager } as never)).toThrow();
    expect(original).not.toHaveBeenCalled();
  });

  it('error message names both the required and the actual state', () => {
    const wrapped = wrapRequireGameState(GameStateType.WaitingForTrade, jest.fn());
    const stateManager = new StateManager();

    expect(() => wrapped.call({ stateManager } as never)).toThrow(
      /Required: waiting_trade.*Current: active/,
    );
  });
});
