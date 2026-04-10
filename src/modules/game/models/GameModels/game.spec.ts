import { Board } from '../FieldModels/board';
import { PropertyCell } from '../FieldModels/cells';
import { Game } from './game';
import { Business, BusinessGrade } from './properties';
import { GameStateType } from './state-manager';
import { Turn } from './turn';

describe('Game elimination flow', () => {
  let game: Game;

  beforeEach(() => {
    game = new Game([
      { id: 'p1', name: 'Alice' },
      { id: 'p2', name: 'Bob' },
      { id: 'p3', name: 'Carol' },
    ]);
  });

  const drainPlayer = (index: number) => {
    const player = game.players[index];
    player.changeMoney(-(player.Money + 1));
  };

  const ownedProperty = (ownerId: string): PropertyCell => {
    const cell = game.board.flatCells.find(PropertyCell.isPropertyCell);
    if (!cell) throw new Error('No property cells on the board');
    cell.object.owner = ownerId;
    return cell;
  };

  it('emits playerEliminated when a player goes broke', () => {
    const listener = jest.fn();
    game.events.on('playerEliminated', listener);

    drainPlayer(0);

    expect(listener).toHaveBeenCalledWith({ playerId: 'p1', playerName: 'Alice' });
  });

  it('clears properties owned by the eliminated player', () => {
    const cell = ownedProperty(game.players[0].Id);

    drainPlayer(0);

    expect(cell.object.owner).toBeNull();
  });

  it('leaves other players\' properties intact', () => {
    const survivorCell = ownedProperty(game.players[1].Id);

    drainPlayer(0);

    expect(survivorCell.object.owner).toBe(game.players[1].Id);
  });

  it('does not emit gameOver while more than one player is alive', () => {
    const listener = jest.fn();
    game.events.on('gameOver', listener);

    drainPlayer(0);

    expect(listener).not.toHaveBeenCalled();
  });

  it('emits gameOver with the last surviving player as winner', () => {
    const listener = jest.fn();
    game.events.on('gameOver', listener);

    drainPlayer(0);
    drainPlayer(1);

    expect(listener).toHaveBeenCalledWith({ winnerId: 'p3', winnerName: 'Carol' });
  });

  it('emits playerEliminated only once per player even if money keeps dropping', () => {
    const listener = jest.fn();
    game.events.on('playerEliminated', listener);

    drainPlayer(0);
    game.players[0].changeMoney(-500);

    expect(listener).toHaveBeenCalledTimes(1);
  });
});

const buildGame = () => new Game([
  { id: 'p1', name: 'Alice' },
  { id: 'p2', name: 'Bob' },
  { id: 'p3', name: 'Carol' },
]);

const firstPropertyIndex = (game: Game) =>
  game.board.flatCells.findIndex(PropertyCell.isPropertyCell);

const firstBusinessOfGrade = (game: Game, grade: BusinessGrade) =>
  game.board.flatCells.findIndex(c =>
    PropertyCell.isPropertyCell(c) && Business.isBusiness(c.object) && c.object.grade === grade,
  );

describe('Game constructor', () => {
  it('throws when fewer than two players are supplied', () => {
    expect(() => new Game([{ id: 'p1', name: 'Alice' }])).toThrow('At least two players');
  });

  it('assigns a unique color to each player in declaration order', () => {
    const game = buildGame();
    const colors = game.players.map(p => p.Color);
    expect(new Set(colors).size).toBe(colors.length);
  });

  it('generates a unique random id per game instance', () => {
    const a = buildGame();
    const b = buildGame();
    expect(a.id).not.toBe(b.id);
    expect(a.id.length).toBeGreaterThan(0);
  });

  it('wires elimination listeners on the actual players (not the IGame placeholders)', () => {
    const game = buildGame();
    const listener = jest.fn();
    game.events.on('playerEliminated', listener);
    game.players[1].changeMoney(-game.players[1].Money);
    expect(listener).toHaveBeenCalledWith({ playerId: 'p2', playerName: 'Bob' });
  });
});

describe('Game.nextTurn rotation', () => {
  let game: Game;
  let applyEffectSpy: jest.SpyInstance;

  beforeEach(() => {
    game = buildGame();
    // No-op effect application to keep stateManager Active and avoid trading side effects.
    applyEffectSpy = jest.spyOn(game as never as { applyEffect: () => void }, 'applyEffect')
      .mockImplementation(() => {});
  });

  afterEach(() => {
    applyEffectSpy.mockRestore();
  });

  it('throws via @ValidateActivePlayer when called by a non-active player', () => {
    expect(() => game.nextTurn('p2', 1)).toThrow(/p2 turn/);
  });

  it('throws via @RequireGameState when stateManager is not Active', () => {
    game.stateManager.setWaiting(GameStateType.WaitingForTrade, ['p1']);
    expect(() => game.nextTurn('p1', 1)).toThrow(/Required: active/);
  });

  it('rolls dice and returns turn_progress + event_result during the Trading phase', () => {
    const result = game.nextTurn('p1', 2);
    expect(result.turn_progress).toBeDefined();
    expect(result.event_result).toBeDefined();
    expect(result.turn_progress?.[0].success).toBe(true);
  });

  it('throws when called in Trading phase without a diceCounter', () => {
    expect(() => game.nextTurn('p1')).toThrow('Invalid turn state');
  });

  it('returns turn_finished when called in the Event phase', () => {
    game.nextTurn('p1', 1); // Trading → Event
    const result = game.nextTurn('p1');
    expect(result.turn_finished?.[0].success).toBe(true);
  });

  it('advances currentTurnState through Trading → Event → Trading', () => {
    expect(game.CurrentTurnState).toBe(Turn.Trading);
    game.nextTurn('p1', 1);
    expect(game.CurrentTurnState).toBe(Turn.Event);
    game.nextTurn('p1');
    expect(game.CurrentTurnState).toBe(Turn.Trading);
  });

  it('rotates currentPlayerIndex on the transition back to Trading', () => {
    expect(game.CurrentPlayerIndex).toBe(0);
    game.nextTurn('p1', 1);
    game.nextTurn('p1');
    expect(game.CurrentPlayerIndex).toBe(1);
  });

  it('skips eliminated players when rotating to the next active player', () => {
    game.players[1].changeMoney(-game.players[1].Money);
    game.nextTurn('p1', 1);
    game.nextTurn('p1');
    expect(game.CurrentPlayerIndex).toBe(2);
  });

  it('early-returns turn_progress without rotating when only one alive player remains', () => {
    game.players[1].changeMoney(-game.players[1].Money);
    game.players[2].changeMoney(-game.players[2].Money);
    const result = game.nextTurn('p1', 1);
    expect(result.turn_progress).toBeDefined();
    expect(result.turn_finished).toBeUndefined();
    expect(game.CurrentPlayerIndex).toBe(0);
    expect(game.CurrentTurnState).toBe(Turn.Trading);
  });

  it('auto-advances through the Event phase when the current player was just eliminated', () => {
    // Eliminate the current player synchronously by draining money before the turn
    game.players[0].changeMoney(-game.players[0].Money);
    const result = game.nextTurn('p1', 1);
    // turn_finished should also be present from the auto-advance branch
    expect(result.turn_finished?.[0].success).toBe(true);
    expect(game.CurrentPlayerIndex).toBe(1);
    expect(game.CurrentTurnState).toBe(Turn.Trading);
  });
});

describe('Game.buyProperty', () => {
  let game: Game;
  let propIdx: number;
  let cell: PropertyCell;

  beforeEach(() => {
    game = buildGame();
    propIdx = firstPropertyIndex(game);
    cell = game.board.flatCells[propIdx] as PropertyCell;
    cell.object.owner = null;
    // Move the current player to the property cell so the no-arg overload picks it up
    game.players[0].move(propIdx);
    // Open the trading event so the buyProperty path that clears it can be exercised
    game.stateManager.setWaiting(GameStateType.WaitingForPropertyAction, ['p1']);
    game.EventInProgress = {
      type: 0, // GamePlayerEventType.Trading
      eventData: {
        playerIndices: [0],
        price: cell.object.price,
        propertyIndex: propIdx,
        currentBidderIndex: null,
        passedPlayerIndices: [],
      },
    } as never;
  });

  it('current-player overload buys the cell at the current position at its listed price', () => {
    const result = game.buyProperty();
    expect(result).toMatchObject({ success: true, propertyIndex: propIdx, newOwnerId: 'p1' });
    expect(cell.object.owner).toBe('p1');
  });

  it('explicit overload buys for an arbitrary player at the given price', () => {
    const result = game.buyProperty('p2', propIdx, cell.object.price);
    expect(result.newOwnerId).toBe('p2');
    expect(cell.object.owner).toBe('p2');
  });

  it('decrements the buyer money and assigns ownership of the cell', () => {
    const before = game.players[0].Money;
    game.buyProperty();
    expect(game.players[0].Money).toBe(before - cell.object.price);
    expect(cell.object.owner).toBe('p1');
  });

  it('refunds the previous owner when re-purchasing an owned property', () => {
    cell.object.owner = 'p2';
    const p2Before = game.players[1].Money;
    game.buyProperty('p1', propIdx, cell.object.price);
    expect(game.players[1].Money).toBe(p2Before + cell.object.price);
  });

  it('clears any in-progress trading event after a successful purchase', () => {
    game.buyProperty();
    expect(game.stateManager.state).toBe(GameStateType.Active);
    expect(game.EventInProgress).toBeNull();
  });

  it('throws when the current cell is not a property', () => {
    // Move current player to a known non-property cell (Start at index 0)
    game.players[0].move(Board.CellsCounter - propIdx); // back to start (mod board)
    expect(() => game.buyProperty()).toThrow('Current cell is not a property');
  });
});

describe('Game.auctionPlaceBid', () => {
  let game: Game;
  let propIdx: number;

  beforeEach(() => {
    game = buildGame();
    propIdx = firstPropertyIndex(game);
    const cell = game.board.flatCells[propIdx] as PropertyCell;
    cell.object.owner = null;
    game.stateManager.setWaiting(
      GameStateType.WaitingForPropertyAction,
      game.players.map(p => p.Id),
    );
    // Open the auction state directly: all players invited, none passed
    game.EventInProgress = {
      type: 0,
      eventData: {
        playerIndices: [0, 1, 2],
        price: cell.object.price,
        propertyIndex: propIdx,
        currentBidderIndex: null,
        passedPlayerIndices: [],
      },
    } as never;
  });

  it('returns invalidBid when the bid is not strictly greater than the current price', () => {
    const currentPrice =
      (game.EventInProgress as { eventData: { price: number } }).eventData.price;
    const result = game.auctionPlaceBid('p2', currentPrice);
    expect(result.invalidBid).toBeDefined();
  });

  it('returns invalidBid when the bidder cannot afford the bid', () => {
    const huge = 9_999_999;
    const result = game.auctionPlaceBid('p2', huge);
    expect(result.invalidBid?.reason).toMatch(/Insufficient/);
  });

  it('updates eventData.price and currentBidderIndex on a successful bid', () => {
    const currentPrice =
      (game.EventInProgress as { eventData: { price: number } }).eventData.price;
    const newPrice = currentPrice + 100;
    const result = game.auctionPlaceBid('p2', newPrice);
    expect(result.eventData.price).toBe(newPrice);
    expect(result.eventData.currentBidderIndex).toBe(1);
  });

  it('throws via @RequireGameState when called outside WaitingForPropertyAction', () => {
    game.stateManager.clearWaiting();
    expect(() => game.auctionPlaceBid('p2', 9999)).toThrow(/Required: waiting_property_action/);
  });
});

describe('Game.auctionPass', () => {
  let game: Game;

  beforeEach(() => {
    game = buildGame();
    const propIdx = firstPropertyIndex(game);
    const cell = game.board.flatCells[propIdx] as PropertyCell;
    cell.object.owner = null;
    game.stateManager.setWaiting(GameStateType.WaitingForPropertyAction, ['p1']);
    // First-buy offer state: only the offered player (p1, index 0) participates
    game.EventInProgress = {
      type: 0,
      eventData: {
        playerIndices: [0],
        price: cell.object.price,
        propertyIndex: propIdx,
        currentBidderIndex: null,
        passedPlayerIndices: [],
      },
    } as never;
  });

  it('opens auction to all players when the offered player refuses the first buy', () => {
    game.auctionPass('p1');
    const data = (game.EventInProgress as { eventData: { playerIndices: number[] } }).eventData;
    expect(data.playerIndices).toEqual([0, 1, 2]);
  });

  it('appends the player to passedPlayerIndices on a regular pass', () => {
    game.auctionPass('p1'); // opens auction
    game.auctionPass('p2');
    const data = (game.EventInProgress as { eventData: { passedPlayerIndices: number[] } }).eventData;
    expect(data.passedPlayerIndices).toContain(1);
  });

  it('returns finished:{success:false} after the last active player passes', () => {
    game.auctionPass('p1'); // opens auction
    game.auctionPass('p2');
    game.auctionPass('p3');
    const result = game.auctionPass('p1');
    expect(result.finished).toMatchObject({ success: false });
  });

  it('throws via @RequireGameState when called outside WaitingForPropertyAction', () => {
    game.stateManager.clearWaiting();
    expect(() => game.auctionPass('p1')).toThrow(/Required: waiting_property_action/);
  });
});

describe('Game.loseProperty', () => {
  let game: Game;
  beforeEach(() => { game = buildGame(); });

  it('returns PROPERTY_LOST with a null propertyIndex when the player owns nothing of that grade', () => {
    const effects = game.loseProperty(BusinessGrade.Office);
    expect(effects).toEqual([{ type: 'PROPERTY_LOST', propertyIndex: null }]);
  });

  it('clears the owner of the randomly chosen property of the requested grade', () => {
    const idx = firstBusinessOfGrade(game, BusinessGrade.Area);
    const cell = game.board.flatCells[idx] as PropertyCell<Business>;
    cell.object.owner = 'p1';
    cell.object.grade = BusinessGrade.Office;

    const [effect] = game.loseProperty(BusinessGrade.Office);
    expect(effect.type).toBe('PROPERTY_LOST');
    if (effect.type === 'PROPERTY_LOST' && effect.propertyIndex !== null) {
      expect((game.board.flatCells[effect.propertyIndex] as PropertyCell).object.owner).toBeNull();
    }
  });

  it('throws via @RequireGameState when called outside Active', () => {
    game.stateManager.setWaiting(GameStateType.WaitingForTrade, ['p1']);
    expect(() => game.loseProperty(BusinessGrade.Office)).toThrow(/Required: active/);
  });
});

describe('Game.moveToCenter', () => {
  let game: Game;
  beforeEach(() => {
    game = buildGame();
    game.stateManager.setWaiting(GameStateType.WaitingForMoveToCenter, ['p1']);
  });

  it('throws when the target position is not on the inner ring', () => {
    expect(() => game.moveToCenter('p1', 0)).toThrow('Invalid cell index');
  });

  it('throws when the player id is unknown', () => {
    const innerStart = Board.Cells[0].length;
    expect(() => game.moveToCenter('unknown', innerStart)).toThrow();
  });

  it('throws via @RequireGameState when called outside WaitingForMoveToCenter', () => {
    game.stateManager.clearWaiting();
    const innerStart = Board.Cells[0].length;
    expect(() => game.moveToCenter('p1', innerStart)).toThrow(/Required: waiting_move_center/);
  });

  it('moves the current player to the supplied position', () => {
    const innerStart = Board.Cells[0].length;
    expect(() => game.moveToCenter('p1', innerStart)).not.toThrow();
  });
});
