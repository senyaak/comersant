import { EventType } from '../events';
import { Property } from '../GameModels/properties';
import {
  EatBusinessCells,
  MarketBusinessCells,
  FoodBusinessCells,
  FarmBusinessCells,
  StadiumBusinessCells,
  ArenaBusinessCells,
  TheaterBusinessCells,
  StorageBusinessCells,
  GovBusinessCells,
  AreaSiteCells,
  SpecialCells,
} from './board';

// Union type for all valid property cell names
export type PropertyCellName =
  | EatBusinessCells
  | MarketBusinessCells
  | FoodBusinessCells
  | FarmBusinessCells
  | StadiumBusinessCells
  | ArenaBusinessCells
  | TheaterBusinessCells
  | StorageBusinessCells
  | GovBusinessCells
  | AreaSiteCells;

// Union type for all valid cell names
export type CellName = PropertyCellName | SpecialCells | EventCellTypes;

// Helper types for specific business groups
export type PrivateBusinessCellName =
  | EatBusinessCells
  | MarketBusinessCells
  | FoodBusinessCells
  | FarmBusinessCells
  | StadiumBusinessCells
  | ArenaBusinessCells
  | TheaterBusinessCells
  | StorageBusinessCells;

function isObject(obj: unknown): obj is Record<string, unknown> {
  if(typeof obj === 'object' && obj !== null) {
    return true;
  } else {
    throw new Error('Cell cast error! Not an object');
  }
}

export abstract class Cell {
  constructor(public readonly name: CellName) {}
}

export class StartCell extends Cell {
  constructor() {
    super('Start');
  }
}

export class InnerStartCell extends Cell {
  constructor() {
    super('InnerStart');
  }
}

export class PropertyCell<T extends Property = Property> extends Cell {
  static isInstancePropertyCell<T extends Property>(
    cell: Cell,
  ): cell is PropertyCell<T> {
    return cell instanceof PropertyCell;
  }

  static isPropertyCell(obj: unknown): obj is PropertyCell {
    return isObject(obj) && 'name' in obj && 'object' in obj;
  }

  constructor(
    name: PropertyCellName,
    public readonly object: T,
  ) {
    super(name);
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

  isStaticEventCell(obj: unknown): obj is StaticEventCell {
    if (typeof obj !== 'object' || obj === null) {
      throw new Error('Invalid StaticEventCell object');
    }
    return 'name' in obj && 'type' in obj;
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

// export function stringToEventCellType(str: string): EventCellTypes {
//   switch (str) {
//     case 'card':
//       return EventCellTypes.card;
//     case 'interactiveEvent':
//       return EventCellTypes.interactiveEvent;
//     case 'staticEvent':
//       return EventCellTypes.staticEvent;
//     default:
//       throw new Error(`Invalid EventCellType string: ${str}`);
//   }
// }

export type CardEventCellTypes =
  | 'post'
  | 'risk'
  | 'surpise';

export function stringToCardEventType(str: unknown): CardEventCellTypes {
  if (typeof str !== 'string') {
    throw new Error(`Invalid CardEventCellType string: ${str}`);
  }
  switch (str) {
    case 'post':
      return 'post';
    case 'risk':
      return 'risk';
    case 'surpise':
      return 'surpise';
    default:
      throw new Error(`Invalid CardEventCellType string: ${str}`);
  }
}
