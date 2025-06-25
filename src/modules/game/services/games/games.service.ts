import { Injectable } from '@nestjs/common';
import { BehaviorSubject } from 'rxjs';

import { Game, PlayersSettings } from '../../models/GameModels/game';

@Injectable()
export class GamesService {
  private games = new BehaviorSubject<Game[]>([]);

  constructor() {
    // console.log('GamesService');
    // this.games.subscribe(this.onGameAdded);
  }

  onGameAdded(game: Game) {}

  createGame(players: PlayersSettings[]): string {
    const game = new Game(players);
    this.games.next([...this.games.getValue(), game]);
    // this.games.push(game);
    this.onGameAdded(game);
    return game.id;
  }

  getGame(id: string): Readonly<Game> {
    // console.log('id', id, this.games);
    const game = this.games.getValue().find(game => game.id === id);
    if (!game) {
      throw new Error('Game not found - SHOULD NOT HAPPEN!');
    }
    return game;
  }

  get Games(): Readonly<BehaviorSubject<Game[]>> {
    return this.games;
  }
}
