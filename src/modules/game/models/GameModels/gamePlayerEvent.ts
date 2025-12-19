import { Player } from './player';

export enum GamePlayerEventType {
  Trading,
  Move,
}

export type GamePlayerEvent = TradingEvent | MoveEvent;

export interface TradingEvent {
  type: GamePlayerEventType.Trading;
  eventData: {
    playerIndices: number[]; // who can participate (1 = first buy offer, >1 = auction)
    price: number; // current bid (initially property price)
    propertyIndex: number; // which property is being sold
    currentBidderIndex: number | null; // who made the last bid (player index)
    passedPlayerIndices: number[]; // who refused to bid (player indices)
    timeRemaining: number; // seconds remaining (10 sec after bid)
    isLocked: boolean; // true for 1 sec after new bid
  };
}

export interface MoveEvent {
  type: GamePlayerEventType.Move;
  eventData: {
    playerId: Player['id'];
  };
}
