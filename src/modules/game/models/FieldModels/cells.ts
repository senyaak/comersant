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

export class TaxServiceCell extends EventCell {
  static isTaxServiceCell(cell: Cell): cell is TaxServiceCell {
    return cell.name === 'TaxService';
  }

  constructor() {
    super('TaxService' as EventCellTypes);
  }
}

export class StaticEventCell extends EventCell {
  static isStaticEventCell(cell: Cell): cell is StaticEventCell {
    return cell.name === 'staticEvent';
  }

  constructor(type: EventType);

  constructor(
    type: EventType.BalanceChange,
    amount: number,
  );

  constructor(
    public readonly type: EventType,
    public readonly amount?: number,
  ) {
    super('staticEvent' as EventCellTypes);
  }

  isStaticEventCell(obj: unknown): obj is StaticEventCell {
    if (typeof obj !== 'object' || obj === null) {
      throw new Error('Invalid StaticEventCell object');
    }
    return 'name' in obj && 'type' in obj;
  }
}

export class InteractiveEventCell extends EventCell {
  static isInteractiveEventCell(cell: Cell): cell is InteractiveEventCell {
    return cell.name === 'interactiveEvent';
  }

  constructor(
    public readonly type: EventType,
  ) {
    super('interactiveEvent' as EventCellTypes);
  }
}

export class CardEventCell extends EventCell {
  private static isCardEventCell(cell: Cell): cell is CardEventCell {
    return cell.name === 'card';
  }

  constructor(
    public readonly type: CardEventCellTypes,
  ) {
    super('card' as EventCellTypes);
  }
}

export type EventCellTypes = 'card'
| 'interactiveEvent'
| 'staticEvent'
| 'TaxService';

export type CardEventCellTypes =
  | 'post'
  | 'risk'
  | 'surprise';

export function stringToCardEventType(str: unknown): CardEventCellTypes {
  if (typeof str !== 'string') {
    throw new Error(`Invalid CardEventCellType string: ${str}`);
  }
  switch (str) {
    case 'post':
      return 'post';
    case 'risk':
      return 'risk';
    case 'surprise':
      return 'surprise';
    default:
      throw new Error(`Invalid CardEventCellType string: ${str}`);
  }
}
