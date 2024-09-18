import { GovBussines, PrivateBussines, Site } from '../GameModels/properties';
import {
  CardEventCell,
  CardEventCellTypes,
  Cell,
  EventCellTypes,
  PropertyCell,
  StartCell,
  StaticEventCell,
} from './cells';

enum BussinessGroups {
  Eat = 1,
}
export class Board {
  cells: Cell[];
  constructor() {
    const Cells = [
      new StartCell(),
      new PropertyCell('gastronomie', new PrivateBussines(BussinessGroups.Eat)),
      new PropertyCell('conditerie', new PrivateBussines(BussinessGroups.Eat)),
      new PropertyCell('backer', new PrivateBussines(BussinessGroups.Eat)),
      new CardEventCell(EventCellTypes.card, CardEventCellTypes.post),
      new StaticEventCell(EventCellTypes.staticEvent),
      new PropertyCell('site', new Site()),
      new CardEventCell(EventCellTypes.card, CardEventCellTypes.surpise),
      new PropertyCell('toys', new GovBussines()),
    ] satisfies Cell[];

    this.cells = Cells;
  }
}
