import { Component, Input } from '@angular/core';
import { Player } from '$server/modules/game/models/GameModels/player';
import { GameService } from 'src/app/modules/game/services/game.service';
import { UserSettingsService } from 'src/app/services/user-settings.service';

@Component({
  selector: 'app-player-info',
  standalone: false,
  templateUrl: './player-info.component.html',
  styleUrl: './player-info.component.scss',
})
export class PlayerInfoComponent {
  @Input({required: true}) playerId!: Player['Id'];

  constructor(private gameService: GameService, private userSettingsService: UserSettingsService) {}

  get isActive() {
    return this.gameService.Game.isPlayerActive(this.player.Id);
  }

  get player(): Player {
    return this.gameService.Game.players.find(p => p.Id === this.playerId)!;
  }

  get turnState() {
    return this.gameService.Game.CurrentTurnState;
  }
}
