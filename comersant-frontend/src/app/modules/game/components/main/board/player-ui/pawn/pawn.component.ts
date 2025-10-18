import { Component, Input } from '@angular/core';
import { Player } from '$server/modules/game/models/GameModels/player';
import { GameService } from 'src/app/modules/game/services/game.service';

import { CellWidth } from '../../cell/abstract/base';

@Component({
  selector: '[app-pawn]',
  standalone: false,
  templateUrl: './pawn.component.html',
  styleUrl: './pawn.component.scss',
})
export class PawnComponent {
  @Input({required: true })
    player!: Player;

  constructor(private gameService: GameService) {}

  get cx(): number {
    // Example calculation, replace with actual logic
    return this.PlayerPosition * CellWidth + 40;
  }

  get cy(): number {
    this.gameService.Game.players.findIndex(p => p.Id === this.player.Id);
    // this.player.Color;
    // Example calculation, replace with actual logic
    // Fixed y position for simplicity
    return 50 + this.gameService.Game.players.findIndex(p => p.Id === this.player.Id) * 20;
  }

  get Player(): Player {
    return this.player;
  }

  get Radius(): number {
    return 15;
  }

  get PlayerPosition(): number {
    return this.player.Position;
  }

  get PlayerColor(): string {
    return this.player.Color;
  }
}
