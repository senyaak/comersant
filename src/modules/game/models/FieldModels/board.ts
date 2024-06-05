import {
  CardEventCell,
  CardEventCellTypes,
  Cell,
  EventCellTypes,
  PropertyCell,
  StaticEventCell,
} from './cells';
import { PrivateBussines } from '../GameModels/properties';

export class Board {
  cells: Cell[];
  constructor() {
    const Cells = [
      new PropertyCell('gastronomie', new PrivateBussines()),
      new PropertyCell('conditerie', new PrivateBussines()),
      new PropertyCell('backer', new PrivateBussines()),
      new CardEventCell(EventCellTypes.card, CardEventCellTypes.post),
      new StaticEventCell(EventCellTypes.staticEvent),
    ] satisfies Cell[];

    this.cells = Cells;
  }
}
