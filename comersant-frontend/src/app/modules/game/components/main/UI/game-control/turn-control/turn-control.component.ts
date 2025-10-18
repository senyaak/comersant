import { Component } from '@angular/core';
import { GameService } from 'src/app/modules/game/services/game.service';

@Component({
  selector: 'app-turn-control',
  standalone: false,
  templateUrl: './turn-control.component.html',
  styleUrl: './turn-control.component.scss',
})
export class TurnControlComponent {
  constructor(
    private gameService: GameService,
  ) {}

  get TurnState() {
    return this.gameService.Game.CurrentTurnState;
  }
}
