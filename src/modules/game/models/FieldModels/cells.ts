import { EventType } from '../events';
import { Player } from '../player';

export abstract class Cell {
  event: (player: Player) => Promise<void>;

  constructor(private name: string) {}
}

export class CellStart extends Cell {
  constructor() {
    super('start');
  }
}

export class Property extends Cell {
  owner: Player | null;
  object: Property;
}

export abstract class EventCell extends Cell {
  constructor(name: EventCellTypes) {
    super(name);
  }
}
export class StaticEventCell extends Cell {
  constructor(name: EventCellTypes.staticEvent) {
    super(name);
  }
}
export class InteractiveEventCell extends Cell {
  constructor(name: EventCellTypes.interactiveEvent) {
    super(name);
  }
}

export class CardEventCell extends EventCell {
  constructor(
    name: EventCellTypes.card,
    private type: CardEventCellTypes,
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
