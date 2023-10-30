import { Injectable } from '@nestjs/common';
import { Game } from '../../models/game';

@Injectable()
export class GamesService {
  games: Game[] = [];

  createGame() {
    console.log('create game');
    const game = new Game();
    this.games.push(game);
    console.log('this.games', this.games);
    return game.id;
  }
}
