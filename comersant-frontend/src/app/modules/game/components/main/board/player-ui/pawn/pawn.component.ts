import { Component, DoCheck, Input, OnDestroy, OnInit } from '@angular/core';
import { Board } from '$server/modules/game/models/FieldModels/board';
import { Player } from '$server/modules/game/models/GameModels/player';
import { GameService } from 'src/app/modules/game/services/game.service';

import {
  AnimationStepMs,
  calculateCircularPosition,
  PlayerOffsetPx,
  Position
} from '../../utils/board-layout.utils';

@Component({
  selector: '[app-pawn]',
  standalone: false,
  templateUrl: './pawn.component.html',
  styleUrl: './pawn.component.scss'
})
export class PawnComponent implements OnInit, DoCheck, OnDestroy {
  @Input({required: true }) player!: Player;

  visualPosition: number = 0;
  private lastCheckedPosition: number = 0;
  private animationTimeout?: number;
  private playerIndex: number = -1;

  constructor(private gameService: GameService) {}

  ngOnInit() {
    this.visualPosition = this.PlayerPosition;
    this.lastCheckedPosition = this.PlayerPosition;
    this.cachePlayerIndex();
  }

  ngDoCheck() {
    const targetPosition = this.PlayerPosition;

    // Detect position change and animate
    if (targetPosition !== this.lastCheckedPosition) {
      this.lastCheckedPosition = targetPosition;
      this.animateToPosition(targetPosition);
    }
  }

  ngOnDestroy() {
    // Clean up timeout to prevent memory leak
    if (this.animationTimeout) {
      clearTimeout(this.animationTimeout);
    }
  }

  private cachePlayerIndex() {
    this.playerIndex = this.gameService.Game.players.findIndex(p => p.Id === this.player.Id);
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
        this.animationTimeout = window.setTimeout(step, AnimationStepMs);
      }
    };

    step();
  }

  get position(): Position {
    return this.calculatePosition(this.visualPosition);
  }

  private calculatePosition(cellIndex: number): Position {
    const pos = calculateCircularPosition(cellIndex);

    // Cache player index if not yet cached
    if (this.playerIndex === -1) {
      this.cachePlayerIndex();
    }

    const offset = (this.playerIndex - this.gameService.Game.players.length / 2) * PlayerOffsetPx;
    return {
      x: pos.x + offset,
      y: pos.y + offset
    };
  }

  get Player(): Player {
    return this.player;
  }

  get PlayerColor(): string {
    return this.player.Color;
  }

  get PlayerPosition(): number {
    return this.player.Position;
  }

  get Radius(): number {
    return 15;
  }
}
