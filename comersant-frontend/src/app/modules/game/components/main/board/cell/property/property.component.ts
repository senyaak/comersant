import { PropertyMods } from '$i18n/mapping';
import { PropertyCell } from '$server/modules/game/models/FieldModels/cells';
import { Business } from '$server/modules/game/models/GameModels/properties';
import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { BaseComponent } from '../abstract/base';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[app-property-cell]',
  templateUrl: './property.component.html',
  styleUrl: './property.component.scss',
})
export class PropertyComponent extends BaseComponent implements OnInit {
  @Input({ required: true }) cell!: PropertyCell<Business>;

  public label?: string;

  constructor(private translate: TranslateService) {
    super();
  }

  get buys(): number[] {
    return this.cell.object.buys;
  }
  get payouts(): number[] {
    return this.cell.object.payouts;
  }

  get topSeparatorY(): number {
    return this.textTopPadding + this.fontSize * 4;
  }
  get botSeparatorY(): number {
    return (
      this.topSeparatorY + this.textPadding + this.fontSize * 4 + this.lineWidth
    );
  }
  get splitterX(): number {
    return this.x + this.width * 0.6;
  }
  get prefixes(): string[] {
    return PropertyMods.map(mod =>
      this.translate.instant(mod).substring(0, 1).toUpperCase(),
    );
  }
  get extraPadding() {
    return 10;
  }
  async ngOnInit() {
    // console.log('this', this);
    this.label = await firstValueFrom(this.translate.get(this.cell.name));
  }
}
