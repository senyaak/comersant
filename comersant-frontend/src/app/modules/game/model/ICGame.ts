import { IGame } from '$server/modules/game/models/GameModels/igame';
import { Turn } from '$server/modules/game/models/GameModels/turn';
import { IDiceResult } from '$server/modules/game/models/types';

// import { TradingState } from './types';

export class ICGame extends IGame {
  nextTurn(): void;
  nextTurn(turnResult: IDiceResult): void;
  nextTurn(turnResult?: IDiceResult): void {
    if (this.currentTurnState === Turn.Trading && turnResult && turnResult.diceRoll !== undefined) {
      this.players[this.currentPlayerIndex].move(turnResult.diceRoll.reduce((a, b) => a + b, 0));
    }

    console.log('next turn');
    this.currentTurnState = this.currentTurnIterator.next().value;
    if (this.currentTurnState === Turn.Trading) {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    }
  }

  // startTrading(cell: PropertyCell, price: number): void {
  //   if(price !== undefined && price <= 0) {
  //     throw new Error('Custom price must be greater than zero');
  //   }

  //   const playerIds: Player['id'][] = [];
  //   if(cell.object.owner === null) {
  //     playerIds.push(this.CurrentPlayer.Id);
  //   } else {
  //     for(const player of this.players) {
  //       if(player.Id !== cell.object.owner) {
  //         playerIds.push(player.Id);
  //       }
  //     }
  //   }

  //   // this.tradingState = {playerIds, price};
  // }
}
