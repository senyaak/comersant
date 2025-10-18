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
    return this.gameService.Game.CurrentPlayer === this.gameService.Game.players.findIndex(
      ({ Id }) => Id === this.gameService.Player?.Id,
    );
  }
}
