import { Board } from '../FieldModels/board';
import { ItemType } from './items';
import { IRawPlayer, Player, PlayerColor } from './player';

describe('Player.changeMoney elimination', () => {
  let player: Player;

  beforeEach(() => {
    player = new Player('p1', PlayerColor.red, 'Alice');
  });

  it('adds money on a positive amount without touching the eliminated flag', () => {
    const before = player.Money;
    player.changeMoney(500);
    expect(player.Money).toBe(before + 500);
    expect(player.Eliminated).toBe(false);
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
  it('creates a player from (id, color, name) tuple with default money and position', () => {
    const p = new Player('id1', PlayerColor.green, 'Bob');
    expect(p.Id).toBe('id1');
    expect(p.Color).toBe(PlayerColor.green);
    expect(p.Name).toBe('Bob');
    expect(p.Money).toBe(150_000);
    expect(p.Position).toBe(0);
  });

  it('restores a player from an IRawPlayer object (id, color, name, money, position)', () => {
    const raw: IRawPlayer = {
      id: 'id2',
      color: PlayerColor.yellow,
      name: 'Carol',
      money: 12_345,
      position: 7,
      raccito: false,
      raccitoCounter: 0,
    };
    const p = new Player(raw);
    expect(p.Id).toBe('id2');
    expect(p.Color).toBe(PlayerColor.yellow);
    expect(p.Name).toBe('Carol');
    expect(p.Money).toBe(12_345);
    expect(p.Position).toBe(7);
  });

  it('throws on invalid constructor arguments', () => {
    expect(() => new Player({ totally: 'wrong' } as never)).toThrow('Invalid Player constructor argument');
  });

  it('known gap: restoring from IRawPlayer drops freezeTurns / raccito / raccitoCounter', () => {
    // If this test starts failing it is almost certainly because the restore path was fixed —
    // in that case, delete this guard and assert the new restored state instead.
    const raw: IRawPlayer = {
      id: 'id3',
      color: PlayerColor.purple,
      name: 'Dave',
      money: 1000,
      position: 0,
      raccito: true,
      raccitoCounter: 42,
    };
    const p = new Player(raw);
    // Not restored — raccito flag and counter silently default
    expect(p.Raccito).toBe(false);
    expect(p.RaccitoCounter).toBe(0);
  });
});

describe('Player.move', () => {
  let p: Player;
  beforeEach(() => { p = new Player('p', PlayerColor.red, 'P'); });

  it('advances position by the given step count', () => {
    p.move(5);
    expect(p.Position).toBe(5);
  });

  it('wraps position around Board.CellsCounter when crossing the start', () => {
    const total = Board.CellsCounter;
    p.move(total - 1);
    p.move(3);
    expect(p.Position).toBe(2);
  });

  it('wraps correctly when steps exceed a full board lap', () => {
    const total = Board.CellsCounter;
    p.move(total * 2 + 5);
    expect(p.Position).toBe(5);
  });

  it('decrements raccitoCounter by step count while raccito is active', () => {
    p.setRaccito();
    const start = p.RaccitoCounter;
    p.move(4);
    expect(p.RaccitoCounter).toBe(start - 4);
  });

  it('throws and decrements freezeTurns when the player is frozen', () => {
    p.skipTurn();
    p.skipTurn();
    expect(() => p.move(3)).toThrow('frozen');
    expect(() => p.move(3)).toThrow('frozen');
  });

  it('does not throw on the next move after freezeTurns reaches zero', () => {
    p.skipTurn();
    expect(() => p.move(2)).toThrow();
    expect(() => p.move(2)).not.toThrow();
    expect(p.Position).toBe(2);
  });
});

describe('Player.moveTo', () => {
  it('looks up the cell name via Board.getTargetPosition and lands on that position', () => {
    const p = new Player('p', PlayerColor.red, 'P');
    const spy = jest.spyOn(Board, 'getTargetPosition').mockReturnValue(13);

    p.moveTo('TaxService');

    expect(spy).toHaveBeenCalledWith('TaxService');
    expect(p.Position).toBe(13);

    spy.mockRestore();
  });
});

describe('Player.skipTurn', () => {
  it('increments the freezeTurns counter', () => {
    const p = new Player('p', PlayerColor.red, 'P');
    p.skipTurn();
    expect(() => p.move(1)).toThrow('frozen');
  });

  it('stacks multiple skipTurn calls so each future move is blocked once', () => {
    const p = new Player('p', PlayerColor.red, 'P');
    p.skipTurn();
    p.skipTurn();
    expect(() => p.move(1)).toThrow();
    expect(() => p.move(1)).toThrow();
    expect(() => p.move(1)).not.toThrow();
  });
});

describe('Player raccito', () => {
  it('setRaccito enables the flag and seeds the counter to two full board laps', () => {
    const p = new Player('p', PlayerColor.red, 'P');
    p.setRaccito();
    expect(p.Raccito).toBe(true);
    expect(p.RaccitoCounter).toBe(Board.CellsCounter * 2);
  });

  it('removeRaccito throws while the counter is still positive', () => {
    const p = new Player('p', PlayerColor.red, 'P');
    p.setRaccito();
    expect(() => p.removeRaccito()).toThrow('Cannot remove raccito');
  });

  it('removeRaccito clears the flag once the counter has been drained by moves', () => {
    const p = new Player('p', PlayerColor.red, 'P');
    p.setRaccito();
    p.move(p.RaccitoCounter);
    expect(() => p.removeRaccito()).not.toThrow();
    expect(p.Raccito).toBe(false);
    expect(p.RaccitoCounter).toBe(0);
  });

  it('setRaccito called twice resets the counter to a full two laps (non-cumulative)', () => {
    const p = new Player('p', PlayerColor.red, 'P');
    p.setRaccito();
    p.move(10); // drain a bit
    p.setRaccito();
    expect(p.RaccitoCounter).toBe(Board.CellsCounter * 2);
  });
});

describe('Player.giveItem', () => {
  it('appends items to the private inventory list in call order', () => {
    const p = new Player('p', PlayerColor.red, 'P');
    p.giveItem(ItemType.TaxFree);
    p.giveItem(ItemType.Security);

    // Player has no public items getter — reach into the private field to verify.
    // If a getter is added later, swap this for the public accessor.
    const items = (p as unknown as { items: ItemType[] }).items;
    expect(items).toEqual([ItemType.TaxFree, ItemType.Security]);
  });
});

describe('Player.Id setter', () => {
  it('updates the id (used by reconnect flow via IGame.updatePlayerIdByName)', () => {
    const p = new Player('old', PlayerColor.red, 'P');
    p.Id = 'new';
    expect(p.Id).toBe('new');
  });
});
