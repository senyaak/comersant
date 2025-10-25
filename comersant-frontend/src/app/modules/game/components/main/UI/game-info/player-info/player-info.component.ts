import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Player } from '$server/modules/game/models/GameModels/player';
import { GameService } from 'src/app/modules/game/services/game.service';
import { UserSettingsService } from 'src/app/services/user-settings.service';

@Component({
  selector: 'app-player-info',
  standalone: false,
  templateUrl: './player-info.component.html',
  styleUrl: './player-info.component.scss',
})
export class PlayerInfoComponent implements OnChanges{
  @Input({required: true}) player!: Player;

  constructor(private gameService: GameService, private userSettingsService: UserSettingsService) {}

  ngOnChanges(changes: SimpleChanges): void {
    console.log('PlayerInfoComponent changes detected:', changes);
    if (changes['player']) {
      // console.log('PlayerInfoComponent player input changed:', this.player);
    }
  }
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
