import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit {
  constructor(
    private readonly gameService: GameService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(async params => {
      try {
        await this.gameService.init(params.get('id'));
        console.log('Game ID:', params.get('id'));
      } catch (e) {
        console.warn(`not found game id: ${params.get('id')}`);
        this.router.navigate(['/']);
      }
    });
  }
}
