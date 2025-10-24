import { IGame } from '$server/modules/game/models/GameModels/igame';
import { Turn } from '$server/modules/game/models/GameModels/turn';
import { IDiceResult } from '$server/modules/game/models/types';

export class ICGame extends IGame {
  nextTurn(turnResult: IDiceResult): void {
    if (this.currentTurnState === Turn.Trading && turnResult.diceRoll !== undefined) {
      this.players[this.currentPlayer].move(turnResult.diceRoll.reduce((a, b) => a + b, 0));
    }

    this.currentTurnState = this.currentTurnIterator.next().value;
    if (this.currentTurnState === Turn.Trading) {
      this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
    }
  }

}
