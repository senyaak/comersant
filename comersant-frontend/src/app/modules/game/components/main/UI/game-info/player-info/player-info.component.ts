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
  @Input({required: true}) player!: Player;

  constructor(private gameService: GameService, private userSettingsService: UserSettingsService) {}

  // ngOnInit() {
  //   console.log('PlayerInfoComponent ngOnInit');
  // }

  // ngOnChanges() {
  //   console.log('PlayerInfoComponent changes detected for player:', this.player);
  // }

  get isActive() {
    return this.gameService.Game.isPlayerActive(this.player.Id);
  }

  get turnState() {
    return this.gameService.Game.CurrentTurnState;
  }
}
