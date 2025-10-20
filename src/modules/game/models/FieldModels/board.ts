import { convertToEventType, EventType as ET } from '../events';
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
  InnerStartCell,
  InteractiveEventCell,
  PropertyCell,
  StartCell,
  StaticEventCell,
  stringToCardEventType,
} from './cells';

enum BussinessGroups {
  Eat = 1,
  Market = 2,
  Food = 3,
  Farm = 4,
  Stadium = 5,
  Arena = 6,
  Theater = 7,
  Storage = 8,
}

function createCells(): Cell[][] {
  return [
      [
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
        new StaticEventCell(
          EventCellTypes.staticEvent,
          ET.BalanceChange,
          -25000,
        ),
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
        new StaticEventCell(
          EventCellTypes.staticEvent,
          ET.BalanceChange,
          15000,
        ),
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
        new InteractiveEventCell(EventCellTypes.interactiveEvent, ET.Racitto),
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
        new StaticEventCell(
          EventCellTypes.staticEvent,
          ET.BalanceChange,
          40_000,
        ),
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
        new InteractiveEventCell(EventCellTypes.interactiveEvent, ET.Racitto),
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
          new PrivateBusiness(BussinessGroups.Arena, 31_000, 26_000, [
            [4_000, 400],
            [15_500, 1_500],
            [55_800, 5_600],
            [124_000, 12_400],
          ]),
        ),
        new PropertyCell(
          'palaceofsport',
          new PrivateBusiness(BussinessGroups.Arena, 18_000, 15_000, [
            [3_700, 300],
            [14_500, 1_500],
            [52_000, 5_200],
            [116_000, 11_600],
          ]),
        ),
        new PropertyCell(
          'olympicstadium',
          new PrivateBusiness(BussinessGroups.Arena, 30_000, 25_000, [
            [3_900, 400],
            [15_000, 1_500],
            [54_000, 5_400],
            [120_000, 12_000],
          ]),
        ),
      ] satisfies Cell[],
      [
        new InnerStartCell(),
        new InteractiveEventCell(EventCellTypes.interactiveEvent, ET.Racitto),
        new CardEventCell(EventCellTypes.card, CardEventCellTypes.surpise),
        new StaticEventCell(
          EventCellTypes.staticEvent,
          ET.BalanceChange,
          11_000,
        ),
        new PropertyCell(
          'conditerie',
          new GovBusiness(48_000, 40_000, [
            [6_200, 700],
            [24_000, 2_400],
            [86_400, 8_600],
            [192_000, 20_000],
          ]),
        ),
        new PropertyCell(
          'dolls',
          new PrivateBusiness(BussinessGroups.Theater, 13_000, 10_000, [
            [1_600, 300],
            [7_500, 700],
            [23_500, 2_400],
            [52_000, 5_600],
          ]),
        ),
        new PropertyCell(
          'children',
          new PrivateBusiness(BussinessGroups.Theater, 19_000, 16_000, [
            [2_400, 300],
            [10_000, 1_000],
            [34_000, 3_500],
            [76_000, 7_500],
          ]),
        ),
        new PropertyCell(
          'ballet',
          new PrivateBusiness(BussinessGroups.Theater, 18_000, 15_000, [
            [2_600, 300],
            [9_000, 900],
            [32_400, 3_200],
            [72_000, 8_000],
          ]),
        ),
        new PropertyCell('Site', new AreaSite(12_000)),
        new CardEventCell(EventCellTypes.card, CardEventCellTypes.post),
        new StaticEventCell(EventCellTypes.staticEvent, ET.SkipTurn),
        new PropertyCell(
          'culture',
          new GovBusiness(40_000, 35_000, [
            [5_200, 500],
            [20_000, 2_000],
            [72_000, 7_200],
            [150_000, 16_000],
          ]),
        ),
        new StaticEventCell(EventCellTypes.staticEvent, ET.MoveToCenter),
        new InteractiveEventCell(EventCellTypes.interactiveEvent, ET.Racitto),
        new StaticEventCell(
          EventCellTypes.staticEvent,
          ET.BalanceChange,
          14_000,
        ),
        new PropertyCell(
          'vegetables',
          new PrivateBusiness(BussinessGroups.Storage, 46_000, 35_000, [
            [5_900, 900],
            [23_000, 2_400],
            [82_500, 8_100],
            [184_000, 19_000],
          ]),
        ),
        new PropertyCell(
          'production',
          new PrivateBusiness(BussinessGroups.Storage, 49_000, 38_000, [
            [6_300, 600],
            [24_000, 2_400],
            [88_000, 8_700],
            [196_000, 19_500],
          ]),
        ),
        new PropertyCell(
          'food',
          new PrivateBusiness(BussinessGroups.Storage, 52_000, 40_000, [
            [6_600, 600],
            [26_000, 2_500],
            [93_600, 9_300],
            [208_000, 21_000],
          ]),
        ),
        new CardEventCell(EventCellTypes.card, CardEventCellTypes.risk),
        new PropertyCell(
          'shoes',
          new GovBusiness(49_000, 45_000, [
            [6_300, 600],
            [24_000, 2_300],
            [88_200, 8_900],
            [190_000, 19_500],
          ]),
        ),
        new CardEventCell(EventCellTypes.card, CardEventCellTypes.post),
        new PropertyCell('Site', new AreaSite(60_000)),
        new StaticEventCell(EventCellTypes.staticEvent, ET.SkipTurn),
      ] satisfies Cell[],
  ];
}

function isValidCell(cell: object): cell is Cell {
  return cell && 'name' in cell && typeof cell.name === 'string';
};

const restoreCells = (cells: object[][]): Cell[][] => {
  return cells.map(row =>
    row.map(cell => {
      if (!isValidCell(cell)) {
        throw new Error(`Invalid cell object: ${JSON.stringify(cell)}`);
      }

      if (cell.name === 'Start') {
        return new StartCell();
      } else if (cell.name === 'InnerStart') {
        return new InnerStartCell();
      } else if (PropertyCell.isPropertyCell(cell)) {
        if (PrivateBusiness.isPrivateBusiness(cell.object)) {
          return new PropertyCell(
            cell.name,
            new PrivateBusiness(
              cell.object.group,
              cell.object.price,
              cell.object.upgradePrice,
              cell.object.grades,
              cell.object.owner,
              cell.object.grade,
            ),
          );
        } else if (GovBusiness.isGovBusiness(cell.object)) {
          return new PropertyCell(
            cell.name,
            new GovBusiness(
              cell.object.price,
              cell.object.upgradePrice,
              cell.object.grades,
              cell.object.owner,
              cell.object.grade,
            ),
          );
        } else if (AreaSite.isAreaSite(cell.object)) {
          return new PropertyCell(
            cell.name,
            new AreaSite(cell.object.price, cell.object.owner),
          );
        } else {
          throw new Error(`Unknown property type in cell: ${cell.name}`);
        }
      } else if (cell.name === EventCellTypes.card && 'type' in cell) {
        return new CardEventCell(EventCellTypes.card, stringToCardEventType(cell.type));
      } else if (cell.name === EventCellTypes.staticEvent && 'type' in cell) {
        const eventType = convertToEventType(cell.type);
        if(eventType === ET.BalanceChange) {
          if('amount' in cell && typeof cell.amount === 'number') {
            return new StaticEventCell(
              EventCellTypes.staticEvent,
              ET.BalanceChange,
              cell.amount,
            );
          } else {
            throw new Error(`Invalid amount for BalanceChange in cell: ${cell.name}`);
          }
        } else {
          return new StaticEventCell(
            EventCellTypes.staticEvent,
            eventType,
          );
        }
      } else if (cell.name === EventCellTypes.interactiveEvent && 'type' in cell) {
        return new InteractiveEventCell(
          EventCellTypes.interactiveEvent,
          convertToEventType(cell.type),
        );
      } else {
        throw new Error(`Unknown cell type: ${cell.name}`);
      }
    }),
  );
};

export class Board {
  /** use as default board to calculate something, DO NOT MODIFY */
  private static readonly _cells: Readonly<Cell>[][] = createCells();
  cells: Cell[][] = createCells();
  constructor();

  constructor(board: Board);
  constructor(board?: Board) {
    if(board) {
      this.cells = restoreCells(board.cells);
    } else {
      this.cells = createCells();
    }
  }

  static get Cells() { return Board._cells; }
  static get CellsCounter(){
    return Board._cells.flat().length;
  }

  get flatCells() { return this.cells.flat(); }

}
