describe('IGame default constructor', () => {
  it.todo('creates two placeholder players for the empty constructor');
  it.todo('initialises currentTurnState to Trading');
  it.todo('initialises currentPlayerIndex to 0');
  it.todo('creates an empty board');
});

describe('IGame restoring constructor', () => {
  it.todo('restores id, players, currentPlayerIndex and currentTurnState from IRawGame');
  it.todo('rebuilds the board from the raw game payload');
  it.todo('restores eventInProgress when the snapshot has one');
  it.todo('advances the turn iterator past Trading when restoring an Event-phase snapshot');
  it.todo('wires elimination cleanup listeners on the restored players');
});

describe('IGame.updatePlayerIdByName', () => {
  it.todo('updates the player id when the name is found');
  it.todo('reassigns ownership of every property currently owned by that player to the new id');
  it.todo('throws when the name is not present in the player list');
});

describe('IGame.isPlayerActive', () => {
  it.todo('returns true for the player at currentPlayerIndex');
  it.todo('returns false for any other player');
  it.todo('returns false for an unknown player id');
});

describe('IGame getters', () => {
  it.todo('CurrentPlayer returns the player at currentPlayerIndex');
  it.todo('CurrentPlayerIndex matches the protected currentPlayerIndex field');
  it.todo('CurrentTurnState returns the current Turn enum value');
  it.todo('EventInProgress getter mirrors the protected field, setter updates it');
});

describe('IGame.clearOwnedProperties (via Player.onEliminated)', () => {
  it.todo('nulls owner on every PropertyCell owned by the eliminated player');
  it.todo('leaves cells owned by other players untouched');
});
