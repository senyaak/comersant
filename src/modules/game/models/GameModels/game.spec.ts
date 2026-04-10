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
