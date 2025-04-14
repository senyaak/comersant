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
  InteractiveEventCell,
  PropertyCell,
  StartCell,
  StaticEventCell,
} from './cells';

enum BussinessGroups {
  Eat = 1,
  Market = 2,
  Food = 3,
  Farm = 4,
  Stadium = 5,
}

export class Board {
  cells: Cell[];
  constructor() {
    const Cells = [
      new StartCell(),
      new PropertyCell(
        'gastronomie',
        new PrivateBusiness(BussinessGroups.Eat, 30_000, 25_000, [
          [900, 400],
          [15_000, 1_500],
          [54_000, 5_200],
          [120_000, 11_000],
        ]),
      ),
      new PropertyCell(
        'conditerie',
        new PrivateBusiness(BussinessGroups.Eat, 32_000, 28_000, [
          [900, 800],
          [15_000, 1_500],
          [58_000, 6_000],
          [124_000, 13_000],
        ]),
      ),
      new PropertyCell(
        'backer',
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
        'toys',
        new GovBusiness(40_000, 32_000, [
          [5_200, 500],
          [20_000, 2_000],
          [70_000, 7_000],
          [150_000, 15_000],
        ]),
      ),
      new StaticEventCell(EventCellTypes.staticEvent, ET.BalanceChange, 15000),
      new PropertyCell(
        'mercery',
        new PrivateBusiness(BussinessGroups.Market, 29_000, 21_000, [
          [3_800, 400],
          [14_500, 1_300],
          [52_000, 5_300],
          [111_000, 11_000],
        ]),
      ),
      new PropertyCell(
        'children',
        new PrivateBusiness(BussinessGroups.Market, 30_000, 22_000, [
          [3_900, 400],
          [15_000, 1_500],
          [54_000, 5_500],
          [120_000, 12_000],
        ]),
      ),
      new PropertyCell(
        'big',
        new PrivateBusiness(BussinessGroups.Market, 28_000, 20_000, [
          [3_700, 400],
          [14_000, 1_400],
          [50_400, 5_100],
          [110_000, 10_000],
        ]),
      ),
      new CardEventCell(EventCellTypes.card, CardEventCellTypes.post),
      new StaticEventCell(EventCellTypes.staticEvent, ET.MoveToCenter),
      new PropertyCell('Site', new AreaSite(25000)),
      new PropertyCell(
        'diner',
        new PrivateBusiness(BussinessGroups.Food, 14_000, 25_000, [
          [1_800, 300],
          [7_000, 700],
          [25_200, 2_500],
          [56_000, 5_800],
        ]),
      ),
      new PropertyCell(
        'cafe',
        new PrivateBusiness(BussinessGroups.Food, 30_000, 22_000, [
          [3_900, 400],
          [15_000, 1_500],
          [54_000, 5_500],
          [120_000, 12_000],
        ]),
      ),
      new PropertyCell(
        'restorant',
        new PrivateBusiness(BussinessGroups.Food, 28_000, 20_000, [
          [3_700, 400],
          [14_000, 1_400],
          [50_400, 5_100],
          [110_000, 10_000],
        ]),
      ),
      new PropertyCell(
        'сanning',
        new GovBusiness(58_000, 50_000, [
          [7_000, 700],
          [29_000, 2_800],
          [104_000, 10_000],
          [230_000, 21_000],
        ]),
      ),
      new CardEventCell(EventCellTypes.card, CardEventCellTypes.surpise),
      new InteractiveEventCell(EventCellTypes.interactiveEvent, ET.Ricatto),
      new PropertyCell(
        'kiosk',
        new PrivateBusiness(BussinessGroups.Farm, 41_000, 35_000, [
          [5_000, 500],
          [20_000, 2_000],
          [73_500, 7_000],
          [162_000, 16_000],
        ]),
      ),
      new PropertyCell(
        'wegetables',
        new PrivateBusiness(BussinessGroups.Farm, 49_000, 42_000, [
          [6_400, 600],
          [25_000, 2_500],
          [88_500, 8_700],
          [195_000, 19_500],
        ]),
      ),
      new PropertyCell(
        'market',
        new PrivateBusiness(BussinessGroups.Farm, 48_000, 40_000, [
          [6_200, 600],
          [24_000, 2_400],
          [86_000, 8_600],
          [180_000, 18_000],
        ]),
      ),
      new StaticEventCell(EventCellTypes.staticEvent, ET.BalanceChange, 40_000),
      new PropertyCell(
        'statefarm',
        new GovBusiness(80_000, 60_000, [
          [10_000, 1_000],
          [40_000, 4_000],
          [130_000, 12_000],
          [310_000, 30_000],
        ]),
      ),
      new CardEventCell(EventCellTypes.card, CardEventCellTypes.post),
      new PropertyCell('Site', new AreaSite(20_000)),
      new InteractiveEventCell(EventCellTypes.interactiveEvent, ET.Ricatto),
      new PropertyCell(
        'spartak',
        new PrivateBusiness(BussinessGroups.Stadium, 15_000, 15_000, [
          [1_900, 300],
          [7_600, 700],
          [15_200, 1_500],
          [60_000, 6_000],
        ]),
      ),
      new PropertyCell(
        'torpedo',
        new PrivateBusiness(BussinessGroups.Stadium, 18_000, 15_000, [
          [2_300, 300],
          [9_000, 700],
          [32_000, 1_500],
          [72_000, 6_000],
        ]),
      ),
      new PropertyCell(
        'luzhniki',
        new PrivateBusiness(BussinessGroups.Stadium, 20_000, 20_000, [
          [2_200, 300],
          [10_000, 1_000],
          [36_000, 3_600],
          [78_000, 7_800],
        ]),
      ),
      new StaticEventCell(EventCellTypes.staticEvent, ET.SkipTurn),
      new CardEventCell(EventCellTypes.card, CardEventCellTypes.risk),
      new StaticEventCell(EventCellTypes.staticEvent, ET.MoveToCenter),
      new PropertyCell(
        'concerthall',
        new PrivateBusiness(BussinessGroups.Stadium, 31_000, 26_000, [
          [4_000, 400],
          [15_500, 1_500],
          [55_800, 5_600],
          [124_000, 12_400],
        ]),
      ),
      new PropertyCell(
        'palaceofsport',
        new PrivateBusiness(BussinessGroups.Stadium, 18_000, 15_000, [
          [3_700, 300],
          [14_500, 1_500],
          [52_000, 5_200],
          [116_000, 11_600],
        ]),
      ),
      new PropertyCell(
        'olympicstadium',
        new PrivateBusiness(BussinessGroups.Stadium, 30_000, 25_000, [
          [3_900, 400],
          [15_000, 1_500],
          [54_000, 5_400],
          [120_000, 12_000],
        ]),
      ),
    ] satisfies Cell[];

    this.cells = Cells;
  }
}
