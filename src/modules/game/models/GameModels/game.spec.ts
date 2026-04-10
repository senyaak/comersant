import { PropertyCell } from '../FieldModels/cells';
import { Game } from './game';

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

describe('Game constructor', () => {
  it.todo('throws when fewer than two players are supplied');
  it.todo('assigns a unique color to each player in declaration order');
  it.todo('generates a unique random id per game instance');
  it.todo('wires elimination listeners on the actual players (not the IGame placeholders)');
});

describe('Game.nextTurn rotation', () => {
  it.todo('throws via @ValidateActivePlayer when called by a non-active player');
  it.todo('throws via @RequireGameState when stateManager is not Active');
  it.todo('rolls dice and returns turn_progress + event_result during the Trading phase');
  it.todo('throws when called in Trading phase without a diceCounter');
  it.todo('returns turn_finished when called in the Event phase');
  it.todo('advances currentTurnState through Trading → Event → Trading');
  it.todo('rotates currentPlayerIndex on the transition back to Trading');
  it.todo('skips eliminated players when rotating to the next active player');
  it.todo('early-returns turn_progress without rotating when only one alive player remains');
  it.todo('auto-advances through the Event phase when the current player was just eliminated');
});

describe('Game.buyProperty', () => {
  it.todo('current-player overload buys the cell at the current position at its listed price');
  it.todo('explicit overload buys for an arbitrary player at the given price');
  it.todo('decrements the buyer money and assigns ownership of the cell');
  it.todo('refunds the previous owner when re-purchasing an owned property');
  it.todo('clears any in-progress trading event after a successful purchase');
  it.todo('throws via @RequireGameState when called outside WaitingForPropertyAction');
  it.todo('throws when the current cell is not a property');
});

describe('Game.auctionPlaceBid', () => {
  it.todo('returns invalidBid when the bid is not strictly greater than the current price');
  it.todo('returns invalidBid when the bidder cannot afford the bid');
  it.todo('updates eventData.price and currentBidderIndex on a successful bid');
  it.todo('throws via @RequireGameState when called outside WaitingForPropertyAction');
});

describe('Game.auctionPass', () => {
  it.todo('opens auction to all players when the offered player refuses the first buy');
  it.todo('appends the player to passedPlayerIndices on a regular pass');
  it.todo('returns finished:{success:false} after the last active player passes');
  it.todo('throws via @RequireGameState when called outside WaitingForPropertyAction');
});

describe('Game.loseProperty', () => {
  it.todo('returns PROPERTY_LOST with a null propertyIndex when the player owns nothing of that grade');
  it.todo('clears the owner of the randomly chosen property of the requested grade');
  it.todo('throws via @RequireGameState when called outside Active');
});

describe('Game.moveToCenter', () => {
  it.todo('throws when the target position is not on the inner ring');
  it.todo('throws when the player id is unknown');
  it.todo('throws via @RequireGameState when called outside WaitingForMoveToCenter');
  it.todo('moves the current player to the supplied position');
});
