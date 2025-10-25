import { ServerToClientEvents } from '../services/events/types';
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
    currentPlayer: IGame['currentPlayer'],
    turn: IGame['currentTurnState'],
  },
  message: 'Turn processed successfully'
}
export interface IDiceResult {
  diceRoll?: number[];
  newPlayerPosition?: number;
}

export interface IEventResult {
  taxPaid?: { amount: number, toPlayerId: Player['id'] };
}
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
//#endregion c2s events results
