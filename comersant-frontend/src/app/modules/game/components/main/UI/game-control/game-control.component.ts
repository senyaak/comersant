import { Component, OnInit } from '@angular/core';
import { GameStateService } from 'src/app/modules/game/services/game-state.service';
import { GameService } from 'src/app/modules/game/services/game.service';

@Component({
  selector: 'app-game-control',
  standalone: false,
  templateUrl: './game-control.component.html',
  styleUrl: './game-control.component.scss',
})
export class GameControlComponent implements OnInit {
  constructor(
    private gameService: GameService,
    private gameStateService: GameStateService,
  ) {}

  ngOnInit() {
    console.log('init turn_progress');
    this.gameService.Socket.on('turn_progress', (...rest) => {
      this.isProcessingTurn = false;
      // this.
      console.log('turn_progress', rest);
      // Handle game updates
    });
  }

  // UI state properties
  isProcessingTurn = false;

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

    // this.
    return 'Next Turn';
  }

  /**
   * Handles the next turn button click
   */
  onNextTurn() {
    if (!this.gameService.isTurnActive || this.isProcessingTurn) {
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
    return this.gameService.isTurnActive;
  }
}
