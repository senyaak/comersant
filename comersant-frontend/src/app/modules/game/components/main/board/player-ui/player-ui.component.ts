import { Component } from '@angular/core';
import { GameService } from 'src/app/modules/game/services/game.service';

@Component({
  selector: '[app-player-ui]',
  standalone: false,
  templateUrl: './player-ui.component.html',
  styleUrl: './player-ui.component.scss',
})
export class PlayerUIComponent {
  constructor(private gameService: GameService) {}

  get Players() {
    return this.gameService.Game.players;
  }
}
