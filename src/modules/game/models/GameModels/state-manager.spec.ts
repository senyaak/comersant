import { GameStateType, StateManager } from './state-manager';

describe('StateManager defaults', () => {
  let sm: StateManager;
  beforeEach(() => { sm = new StateManager(); });

  it('starts in GameStateType.Active', () => {
    expect(sm.state).toBe(GameStateType.Active);
  });

  it('isWaiting is false in the default Active state', () => {
    expect(sm.isWaiting).toBe(false);
  });

  it('expectedPlayers and gameContext start empty', () => {
    expect(sm.expectedPlayers).toEqual([]);
    expect(sm.gameContext).toEqual({});
  });
});

describe('StateManager constructor with initial values', () => {
  it('accepts initial context, state and expected players', () => {
    const sm = new StateManager(
      { seeded: true },
      GameStateType.WaitingForTrade,
      ['p1', 'p2'],
    );
    expect(sm.state).toBe(GameStateType.WaitingForTrade);
    expect(sm.isWaiting).toBe(true);
    expect(sm.expectedPlayers).toEqual(['p1', 'p2']);
    expect(sm.gameContext).toEqual({ seeded: true });
  });
});

describe('StateManager.setWaiting', () => {
  let sm: StateManager;
  beforeEach(() => { sm = new StateManager(); });

  it('switches state to the requested waiting type', () => {
    sm.setWaiting(GameStateType.WaitingForPropertyAction, ['p1']);
    expect(sm.state).toBe(GameStateType.WaitingForPropertyAction);
  });

  it('records the supplied expected player ids', () => {
    sm.setWaiting(GameStateType.WaitingForTrade, ['p1', 'p2']);
    expect(sm.expectedPlayers).toEqual(['p1', 'p2']);
  });

  it('stores the optional context payload, defaulting to an empty object', () => {
    sm.setWaiting(GameStateType.WaitingForTrade, ['p1'], { offer: 100 });
    expect(sm.gameContext).toEqual({ offer: 100 });

    sm.setWaiting(GameStateType.WaitingForTrade, ['p1']);
    expect(sm.gameContext).toEqual({});
  });

  it('isWaiting becomes true after entering any non-Active state', () => {
    sm.setWaiting(GameStateType.WaitingForPlayerChoice, ['p1']);
    expect(sm.isWaiting).toBe(true);
  });

  it('a second setWaiting overwrites the previous expectedPlayers and gameContext (not additive)', () => {
    sm.setWaiting(GameStateType.WaitingForPropertyAction, ['p1', 'p2'], { price: 100 });
    sm.setWaiting(GameStateType.WaitingForTrade, ['p3'], { offer: 500 });

    expect(sm.state).toBe(GameStateType.WaitingForTrade);
    expect(sm.expectedPlayers).toEqual(['p3']);
    expect(sm.gameContext).toEqual({ offer: 500 });
  });
});

describe('StateManager.clearWaiting', () => {
  it('returns state to Active', () => {
    const sm = new StateManager();
    sm.setWaiting(GameStateType.WaitingForTrade, ['p1'], { foo: 1 });
    sm.clearWaiting();
    expect(sm.state).toBe(GameStateType.Active);
  });

  it('empties expectedPlayers and gameContext', () => {
    const sm = new StateManager();
    sm.setWaiting(GameStateType.WaitingForTrade, ['p1', 'p2'], { foo: 1 });
    sm.clearWaiting();
    expect(sm.expectedPlayers).toEqual([]);
    expect(sm.gameContext).toEqual({});
  });
});

describe('StateManager.isPlayerExpected', () => {
  it('returns true for ids in the expected list', () => {
    const sm = new StateManager();
    sm.setWaiting(GameStateType.WaitingForPropertyAction, ['p1', 'p3']);
    expect(sm.isPlayerExpected('p1')).toBe(true);
    expect(sm.isPlayerExpected('p3')).toBe(true);
  });

  it('returns false for ids that were not registered', () => {
    const sm = new StateManager();
    sm.setWaiting(GameStateType.WaitingForPropertyAction, ['p1']);
    expect(sm.isPlayerExpected('p2')).toBe(false);
  });

  it('returns false for previously-expected ids after clearWaiting', () => {
    const sm = new StateManager();
    sm.setWaiting(GameStateType.WaitingForPropertyAction, ['p1', 'p2']);
    sm.clearWaiting();
    expect(sm.isPlayerExpected('p1')).toBe(false);
    expect(sm.isPlayerExpected('p2')).toBe(false);
  });
});

describe('StateManager.isStateValid', () => {
  it('returns true when current state matches the required state', () => {
    const sm = new StateManager();
    expect(sm.isStateValid(GameStateType.Active)).toBe(true);
  });

  it('returns false otherwise', () => {
    const sm = new StateManager();
    expect(sm.isStateValid(GameStateType.WaitingForTrade)).toBe(false);
  });
});
