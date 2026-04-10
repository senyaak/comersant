describe('StateManager defaults', () => {
  it.todo('starts in GameStateType.Active');
  it.todo('isWaiting is false in the default Active state');
  it.todo('expectedPlayers and gameContext start empty');
});

describe('StateManager.setWaiting', () => {
  it.todo('switches state to the requested waiting type');
  it.todo('records the supplied expected player ids');
  it.todo('stores the optional context payload, defaulting to an empty object');
  it.todo('isWaiting becomes true after entering any non-Active state');
});

describe('StateManager.clearWaiting', () => {
  it.todo('returns state to Active');
  it.todo('empties expectedPlayers and gameContext');
});

describe('StateManager.isPlayerExpected', () => {
  it.todo('returns true for ids in the expected list');
  it.todo('returns false for ids that were not registered');
});

describe('StateManager.isStateValid', () => {
  it.todo('returns true when current state matches the required state');
  it.todo('returns false otherwise');
});
