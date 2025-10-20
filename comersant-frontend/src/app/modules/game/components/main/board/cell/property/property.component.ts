import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PropertyMods } from '$i18n/mapping';
import { PropertyCell } from '$server/modules/game/models/FieldModels/cells';
import { Business } from '$server/modules/game/models/GameModels/properties';
import { firstValueFrom } from 'rxjs';

import { BaseComponent } from '../abstract/base';

@Component({
  selector: '[app-property-cell]',
  templateUrl: './property.component.html',
  styleUrl: './property.component.scss',
  standalone: false,
})
export class PropertyComponent extends BaseComponent implements OnInit {
  @Input({ required: true }) cell!: PropertyCell<Business>;

  public label?: string;

  constructor(private translate: TranslateService) {
    super();
  }

  async ngOnInit() {
    // console.log('this', this);
    this.label = await firstValueFrom(this.translate.get(this.cell.name));
  }

  get botSeparatorY(): number {
    return (
      this.topSeparatorY + this.textPadding + this.fontSize * 4 + this.lineWidth
    );
  }

  get buys(): number[] {
    return this.cell.object.buys;
  }

  get extraPadding() {
    return 10;
  }

  get payouts(): number[] {
    return this.cell.object.payouts;
  }

  get prefixes(): string[] {
    return PropertyMods.map(mod =>
      this.translate.instant(mod).substring(0, 1).toUpperCase(),
    );
  }

  get splitterX(): number {
    return this.x + this.width * 0.6;
  }

  get topSeparatorY(): number {
    return this.textTopPadding + this.fontSize * 4;
  }
}
