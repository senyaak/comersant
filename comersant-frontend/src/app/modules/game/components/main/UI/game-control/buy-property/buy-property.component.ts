import { Component } from '@angular/core';
import { GameService } from 'src/app/modules/game/services/game.service';

@Component({
  selector: 'app-buy-property',
  standalone: false,
  templateUrl: './buy-property.component.html',
  styleUrl: './buy-property.component.scss',
})
export class BuyPropertyComponent {
  isLoading: boolean = false;

  constructor(private gameService: GameService) {}

  onBuyProperty() {
    // TODO:
    // this.gameService.buyProperty();
    this.isLoading = true;
  }
}
