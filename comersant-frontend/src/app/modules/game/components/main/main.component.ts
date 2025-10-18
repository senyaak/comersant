import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  standalone: false,
  encapsulation: ViewEncapsulation.None,
})
export class MainComponent implements OnInit {
  initialized = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly gameService: GameService,
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const gameId = params.get('gameId');
      if (!gameId || gameId === this.gameService.Game.id) {
        return;
      }

      this.gameService.init(gameId);
    });

    console.log('init subscribe to gameReady$');
    this.gameService.gameReady$.subscribe((ready) => {
      this.initialized = ready;
      console.log('gameReady$', ready);
    });

  }
}
