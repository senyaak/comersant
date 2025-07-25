import { Injectable } from '@angular/core';

import { GameService } from './game.service';

export enum GameLoopState {
  preRoll, moving, postRoll,
}

@Injectable()
export class GameLoopService {

  private currentState: GameLoopState = GameLoopState.preRoll;
  constructor(private readonly gameService: GameService) { }

  private nextState() {
    switch (this.currentState) {
      case GameLoopState.preRoll:
        this.currentState = GameLoopState.moving;
        break;
      case GameLoopState.moving:
        this.currentState = GameLoopState.postRoll;
        break;
      case GameLoopState.postRoll:
        this.currentState = GameLoopState.preRoll;
        break;
    }
  }

  // initLoop(){}
}
