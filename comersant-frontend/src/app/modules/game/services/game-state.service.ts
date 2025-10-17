import { Injectable } from '@angular/core';

import { GameService } from './game.service';

/** Access to game data */
@Injectable()
export class GameStateService {
  constructor(private gameService: GameService) {
  }

  get Players() {
    return this.gameService.Game.players;
  }

  get isTurnActive(): boolean {
    console.log('isTurnActive');
    console.log('this.gameService.Player?.Id', this.gameService.Player);
    console.log('this.gameService.Player?.Id', this.gameService.Game);
    return this.gameService.Game.CurrentPlayer === this.gameService.Game.players.findIndex(
      ({ Id }) => Id === this.gameService.Player?.Id,
    );
  }
}
