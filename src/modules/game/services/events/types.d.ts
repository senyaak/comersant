import { IEventResult, NextTurnResult, PropertyBoughtResult } from '../../models/types';

export interface ServerToClientEvents {
  propertyBought: (data: PropertyBoughtResult) => void;
  turn_progress: (data: NextTurnResult) => void;
  event_result: (data: IEventResult) => void;
  user_connected: (data: { name: string; id: string }) => void;
}

export interface ClientToServerEvents {
  nextTurn: (payload: { diceCounter: number }) => void;
  buyProperty: () => void;
  message: () => void;
}
