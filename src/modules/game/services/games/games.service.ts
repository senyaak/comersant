import { Injectable } from '@nestjs/common';
import { Game } from '../../models/GameModels/game';

@Injectable()
export class GamesService {
  private games: Game[] = [];

  constructor() {
    console.log('GamesService');
  }

  createGame(players: string[]): string {
    console.log('create game');
    const game = new Game(players);
    this.games.push(game);

    console.log('this.games', this.games);
    return game.id;
  }

  getGame(id: string): Readonly<Game> {
    console.log('id', id, this.games);
    const game = this.games.find(game => game.id === id);
    if (!game) {
      throw new Error('Game not found - SHOULD NOT HAPPEN!');
    }
    return game;
  }

  get Games(): Readonly<Game[]> {
    return this.games;
  }
}
