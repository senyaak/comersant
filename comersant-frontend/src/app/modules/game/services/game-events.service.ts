import { Injectable } from '@angular/core';

import { GameStateService } from './game-state.service';
import { GameService } from './game.service';

@Injectable()
export class GameEventsService {

  constructor(private gameService: GameService, private gameStateService: GameStateService) {
  }

  get Socket() {
    return this.gameService.Socket;
  }

  public buyProperty(): void {
    this.Socket.emit('buyProperty');
  }

  public nextTurn(): boolean {
    if (!this.gameService.isTurnActive || this.gameService.Frozen) {
      return false;
    }
    this.Socket.emit('nextTurn', {diceCounter: this.gameStateService.DiceCounter});
    return true;
  }

  public placeBid(amount: number): void {
    this.Socket.emit('placeBid', { amount });
  }

  public refuseProperty(): void {
    this.Socket.emit('refuseProperty');
  }
}
