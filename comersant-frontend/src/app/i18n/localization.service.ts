import { Injectable } from '@angular/core';
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

@Injectable({
  providedIn: 'root',
})
export class LocalizationService {
  // Property modification levels
  readonly propertyMods: ReadonlyArray<PropertyGrades> = ['areasite', 'office', 'department', 'enterprise'] as const;
  private getPropertyMod(key: string): string {
    const mods: Record<string, () => string> = {
      'Site': () => $localize`:@@Site:Site`,
      'areasite': () => $localize`:@@areasite:Areasite`,
      'office': () => $localize`:@@office:Office`,
      'department': () => $localize`:@@department:Department`,
      'enterprise': () => $localize`:@@enterprise:Enterprise`,
    };
    return mods[key] ? mods[key]() : key;
  }

  private getPropertyName(key: string): string {
    const names: Record<string, () => string> = {
      'gastronomie': () => $localize`:@@gastronomie:Gastronomy`,
      'conditerie_shop': () => $localize`:@@conditerie_shop:Confectionery Shop`,
      'backer': () => $localize`:@@backer:Baker`,
      'toys': () => $localize`:@@toys:Toy Manufacturer`,
      'mercery': () => $localize`:@@mercery:Mercery`,
      'children': () => $localize`:@@children:Toy Store`,
      'big': () => $localize`:@@big:Grand Mall`,
      'diner': () => $localize`:@@diner:Diner`,
      'cafe': () => $localize`:@@cafe:Cafe`,
      'restorant': () => $localize`:@@restorant:Restaurant`,
      'kiosk': () => $localize`:@@kiosk:Kiosk`,
      'wegetables': () => $localize`:@@wegetables:Vegetables`,
      'market': () => $localize`:@@market:Market`,
      'statefarm': () => $localize`:@@statefarm:Statefarm`,
      'spartak': () => $localize`:@@spartak:Spartak`,
      'torpedo': () => $localize`:@@torpedo:Torpedo`,
      'luzhniki': () => $localize`:@@luzhniki:Luzhniki`,
      'concerthall': () => $localize`:@@concerthall:Concert Hall`,
      'palaceofsport': () => $localize`:@@palaceofsport:Palace of Sport`,
      'olympicstadium': () => $localize`:@@olympicstadium:Olympic Stadium`,
      'conditerie': () => $localize`:@@conditerie:Confectionery`,
      'dolls': () => $localize`:@@dolls:Dolls`,
      'children_theater': () => $localize`:@@children_theater:Children Theater`,
      'ballet': () => $localize`:@@ballet:Ballet`,
      'culture': () => $localize`:@@culture:Culture`,
      'vegetables': () => $localize`:@@vegetables:Vegetables`,
      'production': () => $localize`:@@production:Production`,
      'food': () => $localize`:@@food:Food`,
      'shoes': () => $localize`:@@shoes:Shoes`,
      'сanning': () => $localize`:@@canning:сanning`,
    };
    return names[key] ? names[key]() : '';
  }

  getPropertyModPrefix(mod: PropertyGrades): string {
    const translated = this.getPropertyMod(mod);
    return translated.substring(0, 1).toUpperCase();
  }

  translate(key: string): string {
    return this.getPropertyName(key) || this.getPropertyMod(key) || key;
  }
}
