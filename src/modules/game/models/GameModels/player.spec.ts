import { Player, PlayerColor } from './player';

describe('Player.changeMoney elimination', () => {
  let player: Player;

  beforeEach(() => {
    player = new Player('p1', PlayerColor.red, 'Alice');
  });

  it('does not flag elimination while money stays positive', () => {
    player.changeMoney(-1000);
    expect(player.Eliminated).toBe(false);
  });

  it('flags elimination when money drops to zero', () => {
    player.changeMoney(-player.Money);
    expect(player.Eliminated).toBe(true);
  });

  it('flags elimination when money goes negative', () => {
    player.changeMoney(-(player.Money + 1));
    expect(player.Eliminated).toBe(true);
  });

  it('notifies subscribers exactly once on transition to eliminated', () => {
    const listener = jest.fn();
    player.onEliminated(listener);

    player.changeMoney(-(player.Money + 50));
    player.changeMoney(-100);

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('invokes all registered listeners', () => {
    const a = jest.fn();
    const b = jest.fn();
    player.onEliminated(a);
    player.onEliminated(b);

    player.changeMoney(-player.Money);

    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
  });
});

describe('Player constructor', () => {
  it.todo('creates a player from (id, color, name) tuple with default money and position');
  it.todo('restores a player from an IRawPlayer object (id, color, name, money, position)');
  it.todo('throws on invalid constructor arguments');
});

describe('Player.move', () => {
  it.todo('advances position by the given step count');
  it.todo('wraps position around Board.CellsCounter when crossing the start');
  it.todo('decrements raccitoCounter by step count while raccito is active');
  it.todo('throws and decrements freezeTurns when the player is frozen');
  it.todo('does not throw on the next move after freezeTurns reaches zero');
});

describe('Player.moveTo', () => {
  it.todo('moves the player to the position resolved from the target cell name');
});

describe('Player.skipTurn', () => {
  it.todo('increments the freezeTurns counter');
  it.todo('stacks multiple skipTurn calls so each future move is blocked once');
});

describe('Player raccito', () => {
  it.todo('setRaccito enables the flag and seeds the counter to two full board laps');
  it.todo('removeRaccito throws while the counter is still positive');
  it.todo('removeRaccito clears the flag once the counter has been drained by moves');
});

describe('Player.giveItem', () => {
  it.todo('appends an item to the inventory');
});

describe('Player.Id setter', () => {
  it.todo('updates the id (used by reconnect flow via IGame.updatePlayerIdByName)');
});
