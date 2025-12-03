import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Board } from '$server/modules/game/models/FieldModels/board';
import { Player } from '$server/modules/game/models/GameModels/player';
import { Subscription } from 'rxjs';
import { GameService } from 'src/app/modules/game/services/game.service';

import {
  calculateCircularPosition,
  Position,
} from '../../utils/board-layout.utils';

@Component({
  selector: '[app-pawn]',
  standalone: false,
  templateUrl: './pawn.component.html',
  styleUrl: './pawn.component.scss',
})
export class PawnComponent implements OnInit, OnDestroy {

  private $turnProgress?: Subscription;
  private animationTimeout?: number;
  private lastCheckedPosition: number = 0;

  AnimationStepMs = 150;
  @Input({required: true})
    playerId!: Player['Id'];

  PlayerOffsetPx = 10;

  public visualPosition: number = 0;

  constructor(private gameService: GameService) {}

  ngOnDestroy() {
    // Clean up timeout to prevent memory leak
    if (this.animationTimeout) {
      clearTimeout(this.animationTimeout);
    }
    // Unsubscribe from turn progress updates
    this.$turnProgress?.unsubscribe();
  }

  ngOnInit() {
    this.$turnProgress = this.gameService.playerMoved$.subscribe(() => {
      const targetPosition = this.PlayerPosition;

      // Detect position change and animate
      if (targetPosition !== this.lastCheckedPosition) {
        this.lastCheckedPosition = targetPosition;

        this.animateToPosition(targetPosition);
      }
    });
    this.visualPosition = this.PlayerPosition;
    this.lastCheckedPosition = this.PlayerPosition;
  }

  get player(): Player {
    const player = this.gameService.Game.players.find(p => p.Id === this.playerId);
    if (!player) {
      throw new Error(`Player with ID ${this.playerId} not found in game`);
    }
    return player;
  }

  get PlayerColor(): string {
    return this.player.Color;
  }

  get PlayerIndex(): number {
    const result = this.gameService.Game.players.findIndex(p => p.Id === this.playerId);
    if (result === -1) {
      throw new Error('Player not found in game');
    }

    return result;
  }

  get PlayerPosition(): number {
    return this.player.Position;
  }

  get position(): Position {
    return this.calculatePosition(this.visualPosition);
  }

  get Radius(): number {
    return 15;
  }

  private animateToPosition(targetPosition: number) {
    // Clear any ongoing animation
    if (this.animationTimeout) {
      clearTimeout(this.animationTimeout);
    }

    const totalCells = Board.CellsCounter;

    // Validate target position
    if (targetPosition < 0 || targetPosition >= totalCells) {
      console.warn('Invalid target position:', targetPosition);
      return;
    }

    const step = () => {
      if (this.visualPosition === targetPosition) {
        return;
      }

      // Always move forward (wrapping around the board)
      this.visualPosition = (this.visualPosition + 1) % totalCells;

      // Continue if not yet at target
      if (this.visualPosition !== targetPosition) {
        this.animationTimeout = window.setTimeout(step, this.AnimationStepMs);
      }
    };

    step();
  }

  private calculatePosition(cellIndex: number): Position {
    const pos = calculateCircularPosition(cellIndex);

    const offset = (this.PlayerIndex - this.gameService.Game.players.length / 2) * this.PlayerOffsetPx;
    return {
      x: pos.x + offset,
      y: pos.y + offset,
    };
  }
}
