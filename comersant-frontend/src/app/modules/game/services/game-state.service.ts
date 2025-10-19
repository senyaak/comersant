import { Injectable } from '@angular/core';

/** Access to game data */
@Injectable()
export class GameStateService {
  private diceCounter: number = 3;

  constructor() {
  }

  get DiceCounter(): number {
    return this.diceCounter;
  }

  set DiceCounter(value: number) {
    if(value < 1 || value > 3) {
      throw new Error('Invalid dice count');
    }
    this.diceCounter = value;
  }

  // get Players() {
  //   return this.gameService.Game.players;
  // }
}
