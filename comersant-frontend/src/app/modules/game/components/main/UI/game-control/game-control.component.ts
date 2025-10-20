import { Component, OnInit } from '@angular/core';
import { PropertyCell } from '$server/modules/game/models/FieldModels/cells';
import { Player } from '$server/modules/game/models/GameModels/player';
import { Turn } from '$server/modules/game/models/GameModels/turn';
import { GameService } from 'src/app/modules/game/services/game.service';

@Component({
  selector: 'app-game-control',
  standalone: false,
  templateUrl: './game-control.component.html',
  styleUrl: './game-control.component.scss',
})
export class GameControlComponent implements OnInit {
  // UI state properties
  isProcessingTurn = false;

  constructor(
    private gameService: GameService,
    // private gameStateService: GameStateService,
  ) {}

  ngOnInit() {
    this.gameService.turnProgress$.subscribe((result) => {
      if(result.success && result.data.turnResult.diceRoll) {
        const rolls = result.data.turnResult.diceRoll?.join(', ');
        const total = result.data.turnResult.diceRoll?.reduce((a, b) => a + b, 0);

        this.toast(`rolled: ${rolls} = ${total}`);
      }
      this.isProcessingTurn = false;
    });
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

  // REMOVE: Debugging helper
  toast(msg: string) {
    const snackbar = document.createElement('div');
    snackbar.textContent = msg;
    snackbar.style.position = 'fixed';
    snackbar.style.bottom = '20px';
    snackbar.style.left = '50%';
    snackbar.style.transform = 'translateX(-50%)';
    snackbar.style.backgroundColor = '#323232';
    snackbar.style.color = '#fff';
    snackbar.style.padding = '10px 20px';
    snackbar.style.borderRadius = '4px';
    snackbar.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
    snackbar.style.zIndex = '1000';
    snackbar.style.fontSize = '14px';
    snackbar.style.opacity = '0';
    snackbar.style.transition = 'opacity 0.3s ease';

    document.body.appendChild(snackbar);

    // Show the snackbar
    setTimeout(() => {
      snackbar.style.opacity = '1';
    }, 10);

    // Remove the snackbar after 3 seconds
    setTimeout(() => {
      snackbar.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(snackbar);
      }, 300);
    }, 3000);
  }

  get canBuyProperty(): boolean {
    // const canBuyCell = !!Board.cells.flat()[this.Player.Position];
    const cell = this.gameService.Game.board.flatCells[this.Player.Position];
    if(cell instanceof PropertyCell === false) {
      return false;
    }

    const canBuyCell = cell.owner === null;

    return this.TurnState === Turn.Event && this.isMyTurn && canBuyCell;
  }

  get currentPlayerName(): string {
    return this.gameService.Game.players[this.gameService.Game.CurrentPlayer]?.Name || 'No Current Player';
  }

  get isMyTurn(): boolean {
    return this.gameService.isTurnActive;
  }

  get Player(): Player {
    return this.gameService.Player;
  }

  get playerName(): string {
    return this.gameService.Player?.Name || 'Unknown Player';
  }

  get TurnState() {
    return this.gameService.Game.CurrentTurnState;
  }
}
