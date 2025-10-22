import type { IRawGame } from './types';

import { Board } from '../FieldModels/board';
import { PropertyCell } from '../FieldModels/cells';
import { Player, PlayerColor } from './player';
import { Turn, turnIterator } from './turn';

/**
 * Used for typescript as abstract class to prevent compile error coused by cripto
 * */
export class IGame {
  public readonly board: IRawGame['board'] = new Board();
  protected currentPlayer: IRawGame['currentPlayer'] = 0;
  protected currentTurnIterator: IRawGame['currentTurnIterator'] = turnIterator();

  protected currentTurnState: IRawGame['currentTurnState'] = Turn.Trading;
  /** use to create placeholder */
  public readonly id: IRawGame['id'] = '-1';
  public readonly players: Player[] = [
    new Player('0', PlayerColor.red, 'Player 1'),
    new Player('0', PlayerColor.blue, 'Player 2'),
  ];

  constructor()
  constructor(game: IRawGame)
  constructor(
    game?: IRawGame,
  ) {
    if (game) {
      // const a = game.players[0];
      this.id = game.id;
      this.players = game.players.map(player => new Player(player));
      this.currentPlayer = game.currentPlayer;
      this.currentTurnState = game.currentTurnState;
      this.board = new Board(game.board);
      switch (game.currentTurnState) {
        case Turn.Event:
          this.currentTurnIterator.next();
      }
    }
    // init the turn iterator to the current state
    this.currentTurnIterator.next();
  }

  get CurrentPlayer() {
    return this.currentPlayer;
  }

  get CurrentTurnState() {
    return this.currentTurnState;
  }

  isPlayerActive(playerId: string): boolean {
    return this.players.findIndex(player => player.Id === playerId) === this.CurrentPlayer;
  }

  updatePlayerIdByName(name: string, newId: string): void {
    const player = this.players.find(player => player.Name === name);
    for(const cell of this.board.flatCells) {
      if(cell instanceof PropertyCell && cell.object.owner === player?.Id) {
        cell.object.owner = newId;
      }
    }

    if (!player) {
      throw new Error(`Player with name ${name} not found`);
    }
    player.Id = newId;
  }
};
