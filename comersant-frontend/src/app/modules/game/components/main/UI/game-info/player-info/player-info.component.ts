import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Player } from '$server/modules/game/models/GameModels/player';
import { GameService } from 'src/app/modules/game/services/game.service';
import { UserSettingsService } from 'src/app/services/user-settings.service';

@Component({
  selector: 'app-player-info',
  standalone: false,
  templateUrl: './player-info.component.html',
  styleUrl: './player-info.component.scss',
})
export class PlayerInfoComponent implements OnInit, OnChanges {
  @Input({required: true}) player!: Player;

  constructor(private gameService: GameService, private userSettingsService: UserSettingsService) {}

  ngOnInit() {
    console.log('gameService game', this.gameService.Game);
    console.log('gameService player', this.gameService.Player);
    console.log('gameService socket', this.gameService.Socket);
    console.log('userSettingsService', this.userSettingsService.PlayerName);
    // console.log('PlayerInfoComponent initialized with player:', this.player);
    // console.log('PlayerInfoComponent initialized with player:', this.player.Id);
    // console.log('PlayerInfoComponent initialized with player:', this.player.Name);
  }

  ngOnChanges() {
    console.log('PlayerInfoComponent changes detected for player:', this.player);
  }

  get isActive() {
    return this.gameService.Game.isPlayerActive(this.player.Id);
  }
}
