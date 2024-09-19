// import {
//   Backer,
//   Big,
//   Children,
//   Conditerie,
//   Gastronomie,
//   Mercery,
//   Site,
//   Toys,
// } from '$i18n/mapping';

import { EventType as ET } from '../events';
import {
  AreaSite,
  GovBusiness,
  PrivateBusiness,
} from '../GameModels/properties';
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
  Market = 2,
}
export class Board {
  cells: Cell[];
  constructor() {
    const Cells = [
      new StartCell(),
      new PropertyCell('Gastronomie', new PrivateBusiness(BussinessGroups.Eat)),
      new PropertyCell('Conditerie', new PrivateBusiness(BussinessGroups.Eat)),
      new PropertyCell('Backer', new PrivateBusiness(BussinessGroups.Eat)),
      new CardEventCell(EventCellTypes.card, CardEventCellTypes.post),
      new StaticEventCell(EventCellTypes.staticEvent, ET.BalanceChange, -25000),
      new PropertyCell('Site', new AreaSite(15000)),
      new CardEventCell(EventCellTypes.card, CardEventCellTypes.surpise),
      new PropertyCell('Toys', new GovBusiness()),
      new StaticEventCell(EventCellTypes.staticEvent, ET.BalanceChange, 15000),
      new PropertyCell('Mercery', new PrivateBusiness(BussinessGroups.Market)),
      new PropertyCell('Children', new PrivateBusiness(BussinessGroups.Market)),
      new PropertyCell('Big', new PrivateBusiness(BussinessGroups.Market)),
      new CardEventCell(EventCellTypes.card, CardEventCellTypes.post),
    ] satisfies Cell[];

    this.cells = Cells;
  }
}
