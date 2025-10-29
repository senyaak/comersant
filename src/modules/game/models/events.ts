import { Cell } from './FieldModels/cells';
import { BussinessGrade } from './GameModels/properties';

export enum EventType {
  BalanceChange,
  GetEvent,
  MoneyTransfer,
  SkipTurn,
  TaxService,
  Raccito,
  // TODO: consider implement random amount?
  Move,
  MoveTo,
  MoveToCenter,
  MovePlayer,
  PropertyLoss,
}

export function convertToEventType(value: unknown): EventType {
  if (typeof value === 'number' && Object.values(EventType).includes(value)) {
    return value as EventType;
  }
  throw new Error(`Invalid EventType value: ${value}`);
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

interface MoveTo extends BaseEvent {
  type: EventType.MoveToCenter | EventType.MoveTo;
}

export interface MoveToCenterEvent extends MoveTo {
  type: EventType.MoveToCenter;
}

export interface MoveToEvent extends MoveTo {
  // TODO: probably would be better to use unique names for events like tax service etc..
  to: Cell['name'];
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
  grade: BussinessGrade.Enterprise | BussinessGrade.Office;
}

export interface TaxServiceEvent extends BaseEvent {
  type: EventType.TaxService;
}

export type GameEvent =
  | BalanceChangeEvent
  | SkipTurnEvent
  | MoveToEvent
  | MoveToCenterEvent
  | GetEvent
  | MoneyTransferEvent
  | MoveEvent
  | MovePlayerEvent
  | PropertyLossEvent
  | TaxServiceEvent;
