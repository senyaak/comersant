import { Injectable } from '@angular/core';

import { GameStateService } from './game-state.service';
import { GameService } from './game.service';

@Injectable({
  providedIn: 'root',
})
export class GameEventsService {

  constructor(private gameService: GameService, private gameStateService: GameStateService) {
  }

  get Socket() {
    return this.gameService.Socket;
  }

  public buyProperty(): void {
    this.Socket.emit('buyProperty');
  }

  public nextTurn(): void {
    this.Socket.emit('nextTurn', {diceCounter: this.gameStateService.DiceCounter});
  }
}
