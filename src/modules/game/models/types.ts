import { ServerToClientEvents } from '../services/events/types';
import { TradingEvent } from './GameModels/gamePlayerEvent';
import { IGame } from './GameModels/igame';
import { Player } from './GameModels/player';

//#region turn events results
export type ITurnResult = {
  [K in keyof ServerToClientEvents]?: Parameters<ServerToClientEvents[K]>;
};

export type TurnFinishedResult = TurnFinishedSuccess | TurnFinishedError;
export interface TurnFinishedSuccess {
  success: true,
  message: 'Turn finished successfully',
}
export interface TurnFinishedError {
  success: false,
  message: 'Unknown error finishing turn',
}

export type RollTurnResult = RollTurnSuccess | RollTurnError;
export interface RollTurnError {
  success: false,
  message: 'Game not found',
}
export interface RollTurnSuccess {
  success: true,
  data: {
    diceResult: IDiceResult,
    currentPlayer: IGame['currentPlayerIndex'],
    turn: IGame['currentTurnState'],
  },
  message: 'Turn processed successfully'
}
export interface IDiceResult {
  diceRoll: number[];
  newPlayerPosition?: number;
}

export type TradingActionResult = {
  eventData: TradingEvent['eventData'];
  finished?: AuctionResult;
  invalidBid?: { playerIndex: number; reason: string };
};
//#endregion turn events results
//#region c2s events results
export type PropertyBoughtResult = PropertyBoughtResultSuccess | PropertyBoughtResultError;
export interface PropertyBoughtResultSuccess {
  success: true;
  oldOwnerId: Player['id'] | null;
  newOwnerId: Player['id'];
  propertyIndex: number;
  price: number;
}
export interface PropertyBoughtResultError {
  success: false;
}
//#
//#/\n# Auction result type used when auction finishes: either a successful PropertyBoughtResultSuccess
//# (merged with propertyIndex) or a failure shape. Reuse existing `PropertyBoughtResult` type.
export type AuctionResult = PropertyBoughtResult & { propertyIndex: number };
//#endregion c2s events results
