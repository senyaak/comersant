import { PropertyBoughtResult } from '../../models/types';

export interface ServerToClientEvents {
  propertyBought: (data: PropertyBoughtResult) => void;
  turn_progress: (data: NextTurnResult) => void;
  user_connected: (data: { name: string; id: string }) => void;
}

export interface ClientToServerEvents {
  nextTurn: (payload: { diceCounter: number }) => void;
  buyProperty: () => void;
  message: () => void;
}
