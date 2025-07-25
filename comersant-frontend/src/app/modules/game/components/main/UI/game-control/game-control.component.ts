import { Component } from '@angular/core';
import { GameStateService } from 'src/app/modules/game/services/game-state.service';
import { GameService } from 'src/app/modules/game/services/game.service';

@Component({
  selector: 'app-game-control',
  standalone: false,
  templateUrl: './game-control.component.html',
  styleUrl: './game-control.component.scss',
})
export class GameControlComponent {
  constructor(
    private gameService: GameService,
    private gameStateService: GameStateService,
  ) {}

  // UI state properties
  isProcessingTurn = false;

  /**
   * Get appropriate button text based on current state
   */
  getButtonText(): string {
    if (this.isProcessingTurn) {
      return 'Processing...';
    }

    if (!this.gameStateService.isTurnActive) {
      return 'Waiting for your turn';
    }

    return 'Next Turn';
  }

  /**
   * Handles the next turn button click
   */
  onNextTurn(): void {
    if (!this.gameStateService.isTurnActive || this.isProcessingTurn) {
      return;
    }
    this.isProcessingTurn = true;
    this.gameService.nextTurn();
  }

  get playerName(): string {
    return this.gameService.Player?.Name || 'Unknown Player';
  }

  get currentPlayerName(): string {
    return this.gameService.Game.players[this.gameService.Game.CurrentPlayer]?.Name || 'No Current Player';
  }

  get isMyTurn(): boolean {
    return this.gameStateService.isTurnActive;
  }
}
