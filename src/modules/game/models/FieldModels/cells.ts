import { EventType } from '../events';
import { Player } from '../GameModels/player';
import { Property } from '../GameModels/properties';

export abstract class Cell {
  constructor(public readonly name: string) {}
}

export class StartCell extends Cell {
  constructor() {
    super('start');
  }
}

export class PropertyCell<T extends Property = Property> extends Cell {
  owner: Player | null;

  constructor(
    name: string,
    public readonly object: T,
  ) {
    super(name);
    this.owner = null;
  }
}

export abstract class EventCell extends Cell {
  constructor(name: EventCellTypes) {
    super(name);
  }
}
export class StaticEventCell extends EventCell {
  constructor(name: EventCellTypes.staticEvent, type: EventType);
  constructor(
    name: EventCellTypes.staticEvent,
    type: EventType.BalanceChange,
    amount: number,
  );
  constructor(
    name: EventCellTypes.staticEvent,
    public readonly type: EventType,
    public readonly amount?: number,
  ) {
    super(name);
  }
}

export class InteractiveEventCell extends EventCell {
  constructor(
    name: EventCellTypes.interactiveEvent,
    public readonly type: EventType,
  ) {
    super(name);
  }
}

export class CardEventCell extends EventCell {
  constructor(
    name: EventCellTypes.card,
    public readonly type: CardEventCellTypes,
  ) {
    super(name);
  }
}

export enum EventCellTypes {
  card = 'card',
  interactiveEvent = 'interactiveEvent',
  staticEvent = 'staticEvent',
}
export enum CardEventCellTypes {
  post = 'post',
  risk = 'risk',
  surpise = 'surpise',
}
