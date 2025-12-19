import { Player } from './player';

export enum GamePlayerEventType {
  Trading,
  Move,
}

export type GamePlayerEvent = TradingEvent | MoveEvent;

export interface TradingEvent {
  type: GamePlayerEventType.Trading;
  eventData: {
    playerIds: Player['id'][];
    price: number;
  };
}

export interface MoveEvent {
  type: GamePlayerEventType.Move;
  eventData: {
    playerId: Player['id'];
  };
}
