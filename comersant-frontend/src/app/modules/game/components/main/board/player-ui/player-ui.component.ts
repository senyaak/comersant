import { Component, OnInit } from '@angular/core';
import { GameService } from 'src/app/modules/game/services/game.service';

@Component({
  selector: '[app-player-ui]',
  standalone: false,
  templateUrl: './player-ui.component.html',
  styleUrl: './player-ui.component.scss',
})
export class PlayerUIComponent implements OnInit {
  constructor(private gameService: GameService) {}

  get Players() {
    console.log('get players', this.gameService.Game);
    return this.gameService.Game.players;
  }

  ngOnInit(): void {
    console.log('PlayerUIComponent initialized');
  }
}
