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
    if (this.gameService.Spectating) return;
    this.Socket.emit('buyProperty');
  }

  public nextTurn(): void {
    if (!this.gameService.isTurnActive || this.gameService.Frozen || this.gameService.Spectating) {
      return;
    }
    this.Socket.emit('nextTurn', {diceCounter: this.gameStateService.DiceCounter});
  }

  public placeBid(amount: number): void {
    if (this.gameService.Spectating) return;
    this.Socket.emit('placeBid', { amount });
  }

  public refuseProperty(): void {
    if (this.gameService.Spectating) return;
    this.Socket.emit('refuseProperty');
  }
}
