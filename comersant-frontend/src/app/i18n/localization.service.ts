import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalizationService {
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

  getPropertyModPrefix(mod: string): string {
    const translated = this.getPropertyMod(mod);
    return translated.substring(0, 1).toUpperCase();
  }

  translate(key: string): string {
    return this.getPropertyName(key) || this.getPropertyMod(key) || key;
  }
}
