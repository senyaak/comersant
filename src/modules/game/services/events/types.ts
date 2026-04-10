import { GameEffect } from '../../models/GameModels/game/effects';
import { TradingEvent } from '../../models/GameModels/gamePlayerEvent';
import { RollTurnResult, PropertyBoughtResult, TurnFinishedResult } from '../../models/types';

export interface ServerToClientEvents {
  property_bought: (data: PropertyBoughtResult) => void;
  turn_progress: (data: RollTurnResult) => void;
  turn_finished: (data: TurnFinishedResult) => void;
  event_result: (data: GameEffect[]) => void;
  user_connected: (data: { name: string; id: string }) => void;
  auction_updated: (data: TradingEvent['eventData']) => void;
  auction_failed: (data: { propertyIndex: number }) => void;
  bid_failed: () => void;
  player_eliminated: (data: { playerId: string; playerName: string }[]) => void;
  game_over: (data: { winnerId: string; winnerName: string }) => void;
}

export interface ClientToServerEvents {
  nextTurn: (payload: { diceCounter: number }) => void;
  buyProperty: () => void;
  placeBid: (payload: { amount: number }) => void;
  refuseProperty: () => void;
  message: () => void;
}
