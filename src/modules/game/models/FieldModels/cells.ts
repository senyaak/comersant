import { EventType } from '../events';
import { Player } from '../GameModels/player';
import { Property } from '../GameModels/properties';

export abstract class Cell {
  constructor(private name: string) {}

  abstract event(player: Player): Promise<void>;
}

export class StartCell extends Cell {
  constructor() {
    super('start');
  }
  event() {
    return Promise.resolve();
  }
}

export class PropertyCell extends Cell {
  owner: Player | null;
  object: Property;

  constructor(name: string, propertyEntity: Property) {
    super(name);
    this.owner = null;
    this.object = propertyEntity;
  }
  event(player: Player): Promise<void> {
    // TODO: implement
    return Promise.resolve();
  }
}

export abstract class EventCell extends Cell {
  constructor(name: EventCellTypes) {
    super(name);
  }
}
export class StaticEventCell extends EventCell {
  constructor(name: EventCellTypes.staticEvent) {
    super(name);
  }
  event(player: Player): Promise<void> {
    // TODO: implement
    return Promise.resolve();
  }
}
export class InteractiveEventCell extends EventCell {
  constructor(name: EventCellTypes.interactiveEvent) {
    super(name);
  }
  event(player: Player): Promise<void> {
    // TODO: implement
    return Promise.resolve();
  }
}

export class CardEventCell extends EventCell {
  constructor(
    name: EventCellTypes.card,
    private type: CardEventCellTypes,
  ) {
    super(name);
  }
  event(player: Player): Promise<void> {
    // TODO: implement
    return Promise.resolve();
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
