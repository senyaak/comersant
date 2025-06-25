import { Injectable } from '@angular/core';
import { Player, PlayerColor } from '$server/modules/game/models/GameModels/player';

import { GameService } from './game.service';

@Injectable()
export class GameStateService {
  private players: Player[] = [];
  private playerCounter: number = 0;

  constructor(private gameService: GameService) { }
}
