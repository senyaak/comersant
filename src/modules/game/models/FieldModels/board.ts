import { EventType } from '../events';
import {
  Cell,
  CellStart,
  StaticEventCell,
  EventCellTypes,
  CardEventCell,
  CardEventCellTypes,
  Property,
} from './cells';

const Cells = [
  new Property('gastronomie'),
  new Property('conditerie'),
  new Property('backer'),
  new CardEventCell(EventCellTypes.card, CardEventCellTypes.post),
  new StaticEventCell(EventCellTypes.staticEvent),
] satisfies Cell[];

export class Board {
  cells: Cell[];
  constructor() {
    this.cells = Cells;
  }
}
