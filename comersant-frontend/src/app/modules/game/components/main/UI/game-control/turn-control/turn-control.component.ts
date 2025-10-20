import { Component } from '@angular/core';
import { GameStateService } from 'src/app/modules/game/services/game-state.service';
import { GameService } from 'src/app/modules/game/services/game.service';

@Component({
  selector: 'app-turn-control',
  standalone: false,
  templateUrl: './turn-control.component.html',
  styleUrl: './turn-control.component.scss',
})
export class TurnControlComponent {
  public selectedDice: number = 3;

  constructor(
    private gameService: GameService,
    private gameStateService: GameStateService,
  ) {}

  getDiceDots(diceValue: number): number[] {
    return Array(diceValue).fill(0);
  }

  getDotClass(dotIndex: number) {
    return 'dot dot-' + (dotIndex + 1);
  }

  get DiceCounter(): number {
    return this.gameStateService.DiceCounter;
  }

  set DiceCounter(value: number) {
    this.gameStateService.DiceCounter = value;
  }

  get isMyTurn(): boolean {
    return this.gameService.isTurnActive;
  }
}
