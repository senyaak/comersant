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
      new PropertyCell(
        'Gastronomie',
        new PrivateBusiness(
          BussinessGroups.Eat,
          30_000,
          25_000,
          [
            [900, 400],
            [15_000, 1_500],
            [54_000, 5_200],
            [120_000, 11_000],
          ],
          // [[,],[,],[,],[,],],
        ),
      ),
      new PropertyCell(
        'Conditerie',
        new PrivateBusiness(BussinessGroups.Eat, 32_000, 28_000, [
          [900, 800],
          [15_000, 1_500],
          [58_000, 6_000],
          [124_000, 13_000],
        ]),
      ),
      new PropertyCell(
        'Backer',
        new PrivateBusiness(BussinessGroups.Eat, 34_000, 30_000, [
          [1_000, 300],
          [17_000, 1_600],
          [61_500, 6_100],
          [130_000, 14_000],
        ]),
      ),
      new CardEventCell(EventCellTypes.card, CardEventCellTypes.post),
      new StaticEventCell(EventCellTypes.staticEvent, ET.BalanceChange, -25000),
      new PropertyCell('Site', new AreaSite(15000)),
      new CardEventCell(EventCellTypes.card, CardEventCellTypes.surpise),
      new PropertyCell(
        'Toys',
        new GovBusiness(40_000, 32_000, [
          [5_200, 500],
          [20_000, 2_000],
          [70_000, 7_000],
          [150_000, 15_000],
        ]),
      ),
      new StaticEventCell(EventCellTypes.staticEvent, ET.BalanceChange, 15000),
      new PropertyCell(
        'Mercery',
        new PrivateBusiness(BussinessGroups.Market, 29_000, 21_000, [
          [3_800, 400],
          [14_500, 1_300],
          [52_000, 5_300],
          [111_000, 11_000],
        ]),
      ),
      new PropertyCell(
        'Children',
        new PrivateBusiness(BussinessGroups.Market, 30_000, 22_000, [
          [3_900, 400],
          [15_000, 1_500],
          [54_000, 5_500],
          [120_000, 12_000],
        ]),
      ),
      new PropertyCell(
        'Big',
        new PrivateBusiness(BussinessGroups.Market, 28_000, 20_000, [
          [3_700, 400],
          [14_000, 1_400],
          [50_400, 5_100],
          [110_000, 10_000],
        ]),
      ),
      new CardEventCell(EventCellTypes.card, CardEventCellTypes.post),
    ] satisfies Cell[];

    this.cells = Cells;
  }
}
