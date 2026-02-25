import { TradingEvent } from '../../models/GameModels/gamePlayerEvent';
import { IEventResult, RollTurnResult, PropertyBoughtResult, TurnFinishedResult } from '../../models/types';

export interface ServerToClientEvents {
  property_bought: (data: PropertyBoughtResult) => void;
  turn_progress: (data: RollTurnResult) => void;
  turn_finished: (data: TurnFinishedResult) => void;
  event_result: (data: IEventResult[]) => void;
  user_connected: (data: { name: string; id: string }) => void;
  auction_updated: (data: TradingEvent['eventData']) => void;
  auction_failed: (data: { propertyIndex: number }) => void;
  bid_failed: () => void;
}

export interface ClientToServerEvents {
  nextTurn: (payload: { diceCounter: number }) => void;
  buyProperty: () => void;
  placeBid: (payload: { amount: number }) => void;
  refuseProperty: () => void;
  message: () => void;
}
