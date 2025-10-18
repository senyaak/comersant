import type { IRawGame } from './types';

import { Player, PlayerColor } from './player';
import { Turn, turnIterator } from './turn';

/**
 * Used for typescript as abstract class to prevent compile error coused by cripto
 * */
export class IGame {
  /** use to create placeholder */
  public readonly id: IRawGame['id'] = '-1';
  public readonly players: Player[] = [
    new Player('0', PlayerColor.red, 'Player 1'),
    new Player('0', PlayerColor.blue, 'Player 2'),
  ];

  protected currentPlayer: IRawGame['currentPlayer'] = 0;
  protected currentTurnState: IRawGame['currentTurnState'] = Turn.Trading;
  protected currentTurnIterator: IRawGame['currentTurnIterator'] = turnIterator();
  protected isClient: boolean = false;

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

      switch (game.currentTurnState) {
        case Turn.Event:
          this.currentTurnIterator.next();
      }
      this.isClient = true;
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
    if (!player) {
      throw new Error(`Player with name ${name} not found`);
    }
    player.Id = newId;
  }

  nextTurn(playerId: string) {
    if(!this.isPlayerActive(playerId)) {
      throw new Error(`It's not player ${playerId} turn`);
    }

    switch (this.currentTurnState) {
      case Turn.Trading: {
        break;
      }
      case Turn.Event: {
        break;
      }
    }
    this.currentTurnState = this.currentTurnIterator.next().value;
    // check if turn is over
    if (this.currentTurnState === Turn.Trading) {
      this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
    }
  }

  // TODO: implement different classes for client and server
  /** client side only */
  forceNextTurn(): void {
    if (!this.isClient) {
      throw new Error('forceNextTurn can only be called on the client');
    }
    console.log('forceNextTurn called', this);
    this.currentTurnState = this.currentTurnIterator.next().value;
    if (this.currentTurnState === Turn.Trading) {
      this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
    }
  }
};
