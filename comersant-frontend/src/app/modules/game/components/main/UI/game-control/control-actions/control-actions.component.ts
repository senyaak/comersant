import { Component, HostListener, OnInit } from '@angular/core';
import { GameEventsService } from 'src/app/modules/game/services/game-events.service';
import { GameService } from 'src/app/modules/game/services/game.service';

@Component({
  selector: 'app-control-actions',
  standalone: false,
  templateUrl: './control-actions.component.html',
  styleUrl: './control-actions.component.scss',
})
export class ControlActionsComponent implements OnInit {
  isProcessingTurn = false;

  constructor(
    private gameEventsService: GameEventsService,
    private gameService: GameService,
  ) {}

  ngOnInit() {
    this.gameService.turnProgress$.subscribe((result) => {
      if (result.success && result.data.diceResult.diceRoll) {
        const rolls = result.data.diceResult.diceRoll?.join(', ');
        const total = result.data.diceResult.diceRoll?.reduce((a, b) => a + b, 0);

        this.gameEventsService.toast(`rolled: ${rolls} = ${total}`);
      }
      this.isProcessingTurn = false;
    });
    this.gameService.turnFinished$.subscribe((result) => {
      if (result.success) {
        this.gameEventsService.toast('Turn finished successfully');
      }
      console.log('turnFinished subscription', result);
      this.isProcessingTurn = false;
    });
  }

  get isMyTurn(): boolean {
    return this.gameService.isTurnActive;
  }

  /**
   * Get appropriate button text based on current state
   */
  getButtonText(): string {
    if (this.isProcessingTurn) {
      return 'Processing...';
    }

    if (!this.gameService.isTurnActive) {
      return 'Waiting for your turn';
    }

    return 'Next Turn';
  }

  @HostListener('document:keydown.e', ['$event'])
  handleKeyE(event: KeyboardEvent) {
    console.log('Нажата клавиша E');
    event.preventDefault();
    this.onNextTurn();
  }

  /**
   * Handles the next turn button click
   */
  onNextTurn() {
    if (!this.gameService.isTurnActive || this.isProcessingTurn) {
      return;
    }
    this.isProcessingTurn = true;
    this.gameEventsService.nextTurn();
  }
}

