import { Component } from '@angular/core';
import { GameEventsService } from 'src/app/modules/game/services/game-events.service';
import { GameService } from 'src/app/modules/game/services/game.service';

@Component({
  selector: 'app-buy-property',
  standalone: false,
  templateUrl: './buy-property.component.html',
  styleUrl: './buy-property.component.scss',
})
export class BuyPropertyComponent {
  isLoading: boolean = false;

  constructor(private gameEventsService: GameEventsService) {}

  onBuyProperty() {
    console.log('Buy property clicked');
    // TODO:
    this.gameEventsService.buyProperty();
    this.isLoading = true;
  }
}
