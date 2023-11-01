import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
  ) {}

  ngOnInit() {
    console.log('----');
    this.route.paramMap.subscribe(params => {
      this.gameService.init(params.get('id'));
    });
  }
}
