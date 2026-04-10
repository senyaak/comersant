import { Board } from '../FieldModels/board';
import { PropertyCell } from '../FieldModels/cells';
import { IGame } from './igame';
import { IRawPlayer, PlayerColor } from './player';
import { Turn, turnIterator } from './turn';
import { IRawGame } from './types';

const rawPlayer = (id: string, name: string, color: PlayerColor): IRawPlayer => ({
  id,
  color,
  name,
  money: 1000,
  position: 0,
  raccito: false,
  raccitoCounter: 0,
});

const buildRawGame = (overrides: Partial<IRawGame> = {}): IRawGame => ({
  id: 'g1',
  players: [
    rawPlayer('p1', 'Alice', PlayerColor.red),
    rawPlayer('p2', 'Bob', PlayerColor.blue),
    rawPlayer('p3', 'Carol', PlayerColor.green),
  ],
  currentPlayerIndex: 1,
  currentTurnState: Turn.Trading,
  currentTurnIterator: turnIterator(),
  board: new Board(),
  eventInProgress: null,
  ...overrides,
});

describe('IGame default constructor', () => {
  let game: IGame;
  beforeEach(() => { game = new IGame(); });

  it('creates two placeholder players for the empty constructor', () => {
    expect(game.players).toHaveLength(2);
    expect(game.players[0].Name).toBe('Player 1');
    expect(game.players[1].Name).toBe('Player 2');
  });

  it('initialises currentTurnState to Trading', () => {
    expect(game.CurrentTurnState).toBe(Turn.Trading);
  });

  it('initialises currentPlayerIndex to 0', () => {
    expect(game.CurrentPlayerIndex).toBe(0);
  });

  it('creates a populated Board instance with a Start cell at index 0', () => {
    expect(game.board).toBeInstanceOf(Board);
    expect(game.board.flatCells[0].name).toBe('Start');
  });

  it('EventInProgress returns null initially', () => {
    expect(game.EventInProgress).toBeNull();
  });
});

describe('IGame restoring constructor', () => {
  it('restores id, players, currentPlayerIndex and currentTurnState from IRawGame', () => {
    const game = new IGame(buildRawGame());
    expect(game.id).toBe('g1');
    expect(game.players).toHaveLength(3);
    expect(game.players.map(p => p.Id)).toEqual(['p1', 'p2', 'p3']);
    expect(game.CurrentPlayerIndex).toBe(1);
    expect(game.CurrentTurnState).toBe(Turn.Trading);
  });

  it('rebuilds the board as a fresh Board instance (not sharing the raw payload reference)', () => {
    const raw = buildRawGame();
    const game = new IGame(raw);
    expect(game.board).toBeInstanceOf(Board);
    expect(game.board).not.toBe(raw.board); // new instance via restoreCells
    expect(game.board.flatCells[0].name).toBe('Start');
  });

  it('restores eventInProgress when the snapshot has one', () => {
    const event = { type: 0, eventData: { playerId: 'p1' } } as never;
    const game = new IGame(buildRawGame({ eventInProgress: event }));
    expect(game.EventInProgress).toBe(event);
  });

  it('Trading-phase restore leaves the iterator positioned so the next yield is Event', () => {
    const game = new IGame(buildRawGame({ currentTurnState: Turn.Trading }));
    const iter = (game as unknown as {
      currentTurnIterator: Generator<Turn>;
    }).currentTurnIterator;
    expect(iter.next().value).toBe(Turn.Event);
  });

  it('Event-phase restore advances the iterator one extra step so the next yield is Trading', () => {
    const game = new IGame(buildRawGame({ currentTurnState: Turn.Event }));
    expect(game.CurrentTurnState).toBe(Turn.Event);
    const iter = (game as unknown as {
      currentTurnIterator: Generator<Turn>;
    }).currentTurnIterator;
    expect(iter.next().value).toBe(Turn.Trading);
  });

  it('wires elimination cleanup listeners on the restored players', () => {
    const game = new IGame(buildRawGame());
    const cell = game.board.flatCells.find(PropertyCell.isPropertyCell)!;
    cell.object.owner = 'p1';

    game.players[0].changeMoney(-game.players[0].Money);

    expect(cell.object.owner).toBeNull();
  });
});

describe('IGame.updatePlayerIdByName', () => {
  let game: IGame;
  beforeEach(() => { game = new IGame(buildRawGame()); });

  it('updates the player id when the name is found', () => {
    game.updatePlayerIdByName('Alice', 'new-id');
    expect(game.players.find(p => p.Name === 'Alice')!.Id).toBe('new-id');
  });

  it('reassigns ownership of every property currently owned by that player to the new id', () => {
    const cells = game.board.flatCells.filter(PropertyCell.isPropertyCell);
    cells[0].object.owner = 'p1';
    cells[1].object.owner = 'p1';

    game.updatePlayerIdByName('Alice', 'new-id');

    expect(cells[0].object.owner).toBe('new-id');
    expect(cells[1].object.owner).toBe('new-id');
  });

  it('throws when the name is not present in the player list', () => {
    expect(() => game.updatePlayerIdByName('Nobody', 'x')).toThrow('not found');
  });

  it('updates the player id without touching any board cells when the player owns nothing', () => {
    // Seed another player\'s ownership so we can prove it is left alone
    const cells = game.board.flatCells.filter(PropertyCell.isPropertyCell);
    cells[0].object.owner = 'p2';

    game.updatePlayerIdByName('Alice', 'new-id');

    expect(game.players.find(p => p.Name === 'Alice')!.Id).toBe('new-id');
    expect(cells[0].object.owner).toBe('p2');
    // null-owner cells stay null (guard against "null === undefined?.Id" type confusion)
    expect(cells[1].object.owner).toBeNull();
  });
});

describe('IGame.isPlayerActive', () => {
  let game: IGame;
  beforeEach(() => { game = new IGame(buildRawGame()); });

  it('returns true for the player at currentPlayerIndex', () => {
    // currentPlayerIndex defaults to 1 in buildRawGame
    expect(game.isPlayerActive('p2')).toBe(true);
  });

  it('returns false for any other player', () => {
    expect(game.isPlayerActive('p1')).toBe(false);
    expect(game.isPlayerActive('p3')).toBe(false);
  });

  it('returns false for an unknown player id', () => {
    expect(game.isPlayerActive('unknown')).toBe(false);
  });
});

describe('IGame getters', () => {
  let game: IGame;
  beforeEach(() => { game = new IGame(buildRawGame()); });

  it('CurrentPlayer returns the player at currentPlayerIndex', () => {
    expect(game.CurrentPlayer.Id).toBe('p2');
  });

  it('CurrentPlayerIndex matches the protected currentPlayerIndex field', () => {
    expect(game.CurrentPlayerIndex).toBe(1);
  });

  it('CurrentTurnState returns the current Turn enum value', () => {
    expect(game.CurrentTurnState).toBe(Turn.Trading);
  });

  it('EventInProgress getter mirrors the protected field, setter updates it', () => {
    expect(game.EventInProgress).toBeNull();
    const event = { type: 0, eventData: { playerId: 'p1' } } as never;
    game.EventInProgress = event;
    expect(game.EventInProgress).toBe(event);
  });
});

describe('IGame.clearOwnedProperties (via Player.onEliminated)', () => {
  let game: IGame;
  beforeEach(() => { game = new IGame(buildRawGame()); });

  it('nulls owner on every PropertyCell owned by the eliminated player', () => {
    const cells = game.board.flatCells.filter(PropertyCell.isPropertyCell);
    cells[0].object.owner = 'p1';
    cells[1].object.owner = 'p1';

    game.players[0].changeMoney(-game.players[0].Money);

    expect(cells[0].object.owner).toBeNull();
    expect(cells[1].object.owner).toBeNull();
  });

  it('leaves cells owned by other players untouched', () => {
    const cells = game.board.flatCells.filter(PropertyCell.isPropertyCell);
    cells[0].object.owner = 'p1';
    cells[1].object.owner = 'p2';

    game.players[0].changeMoney(-game.players[0].Money);

    expect(cells[1].object.owner).toBe('p2');
  });
});
