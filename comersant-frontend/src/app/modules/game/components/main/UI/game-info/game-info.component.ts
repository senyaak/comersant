import { Component } from '@angular/core';
import { Player } from '$server/modules/game/models/GameModels/player';
import { GameStateService } from 'src/app/modules/game/services/game-state.service';

@Component({
  selector: 'app-game-info',
  standalone: false,
  templateUrl: './game-info.component.html',
  styleUrl: './game-info.component.scss',
})
export class GameInfoComponent {
  constructor(private readonly gameStateService: GameStateService) {

  }

  get Players() {
    return this.gameStateService.Players;
  }

  playerId(index: number, player: Player) {
    return player.Id;
  }

}
