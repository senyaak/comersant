import { Component } from '@angular/core';
import { Player } from '$server/modules/game/models/GameModels/player';
import { GameService } from 'src/app/modules/game/services/game.service';

@Component({
  selector: 'app-game-info',
  standalone: false,
  templateUrl: './game-info.component.html',
  styleUrl: './game-info.component.scss',
})
export class GameInfoComponent {
  constructor(
    private readonly gameService: GameService,
  ) {

  }

  playerId(index: number, player: Player) {
    return player.Id;
  }

  get Players() {
    return this.gameService.Game.players;
  }

}
