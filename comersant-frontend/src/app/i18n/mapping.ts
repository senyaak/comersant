import {
  AreaSiteCells,
  ArenaBusinessCells,
  EatBusinessCells,
  FarmBusinessCells,
  FoodBusinessCells,
  GovBusinessCells,
  MarketBusinessCells,
  StadiumBusinessCells,
  StorageBusinessCells,
  TheaterBusinessCells,
} from '$server/modules/game/models/FieldModels/board';
import { CardEventCellTypes } from '$server/modules/game/models/FieldModels/cells';

// Property asset grades/levels
export type PropertyGrades = 'areasite' | 'office' | 'department' | 'enterprise';

// Union type for all valid cell names that can be translated
export type TranslatableCellName =
  | EatBusinessCells
  | MarketBusinessCells
  | FoodBusinessCells
  | FarmBusinessCells
  | StadiumBusinessCells
  | ArenaBusinessCells
  | TheaterBusinessCells
  | StorageBusinessCells
  | GovBusinessCells
  | AreaSiteCells
  | CardEventCellTypes
  | PropertyGrades;

// Type-safe translation marker function
export function _(key: TranslatableCellName): string {
  return key;
}

/** bussinesses */
export const gastronomie = _('gastronomie');
export const conditerieShop = _('conditerie_shop');
export const backer = _('backer');
export const toys = _('toys');
export const mercery = _('mercery');
export const children = _('children');
export const big = _('big');
export const diner = _('diner');
export const cafe = _('cafe');
export const restorant = _('restorant');
export const kiosk = _('kiosk');
export const wegetables = _('wegetables');
export const market = _('market');
export const statefarm = _('statefarm');
export const spartak = _('spartak');
export const torpedo = _('torpedo');
export const luzhniki = _('luzhniki');
export const concerthall = _('concerthall');
export const palaceofsport = _('palaceofsport');
export const olympicstadium = _('olympicstadium');
export const conditerie = _('conditerie');

export const dolls = _('dolls');
export const childrenTheater = _('children_theater');
export const ballet = _('ballet');
export const culture = _('culture');
export const vegetables = _('vegetables');
export const production = _('production');
export const food = _('food');
export const shoes = _('shoes');
export const canning = _('сanning'); // Note: Cyrillic 'с'
/**============================*/

export const surpise = _('surpise');
export const post = _('post');
export const risk = _('risk');

/**============================*/
export const Site = _('Site');

export const Area = _('areasite');
export const Office = _('office');
export const Department = _('department');
export const Enterprise = _('enterprise');
export const PropertyMods = [Area, Office, Department, Enterprise];
