export enum EventType {
  BalanceChange,
  GetEvent,
  MoneyTransfer,
  SkipTurn,
  Ricatto,
  Move,
  MoveTo,
  MoveToCenter,
  MovePlayer,
  PropertyLoss,
}

export enum EventItem {
  Mail,
  Risk,
  Surprise,
  TaxFree,
  Security,
}

interface BaseEvent {
  msg: string;
  type: EventType;
}

export interface BalanceChangeEvent extends BaseEvent {
  amount: number;
  type: EventType.BalanceChange;
}

export interface SkipTurnEvent extends BaseEvent {
  type: EventType.SkipTurn;
}

interface MoveToBase extends BaseEvent {
  type: EventType.MoveToCenter | EventType.MoveTo;
}

export interface MoveToCenterEvent extends MoveToBase {}

export interface MoveToEvent extends MoveToBase {
  to: number;
}

export interface GetEvent extends BaseEvent {
  item: EventItem;
  type: EventType.GetEvent;
}

export interface MoneyTransferEvent extends BaseEvent {
  amount: number;
  type: EventType.MoneyTransfer;
}

export interface MoveEvent extends BaseEvent {
  amount: number;
  type: EventType.Move;
}

export interface MovePlayerEvent extends BaseEvent {
  type: EventType.MovePlayer;
}

export interface PropertyLossEvent extends BaseEvent {
  type: EventType.PropertyLoss;
}

export type Event =
  | BalanceChangeEvent
  | SkipTurnEvent
  | MoveToEvent
  | MoveToCenterEvent
  | GetEvent
  | MoneyTransferEvent
  | MoveEvent
  | MovePlayerEvent
  | PropertyLossEvent;
