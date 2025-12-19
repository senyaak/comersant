import { Component, Input, OnInit } from '@angular/core';
import { GovPropertyColor, PropertyGroupsColors } from '$server/modules/game/models/FieldModels/board';
import { PropertyCell } from '$server/modules/game/models/FieldModels/cells';
import { Business, PrivateBusiness } from '$server/modules/game/models/GameModels/properties';
import { LocalizationService } from 'src/app/i18n/localization.service';
import { GameService } from 'src/app/modules/game/services/game.service';

import { Asset } from '../abstract/asset';

@Component({
  selector: '[app-property-cell]',
  templateUrl: './property.component.html',
  styleUrl: './property.component.scss',
  standalone: false,
})
export class PropertyComponent extends Asset implements OnInit {
  @Input({ required: true }) cell!: PropertyCell<Business>;
  label?: string;

  @Input({ required: false }) staticMode: boolean = false;

  constructor(
    private localization: LocalizationService,
    protected gameService: GameService,
  ) {
    super();
  }

  ngOnInit() {
    this.label = this.localization.translate(this.cell.name);
  }

  get botSeparatorY(): number {
    return (
      this.topSeparatorY + this.textPadding + this.fontSize * 4 + this.lineWidth
    );
  }

  get buys(): number[] {
    return this.cell.object.buys;
  }

  get cellColor() {
    if(PrivateBusiness.isPrivateBusiness(this.cell.object)) {
      return PropertyGroupsColors[this.cell.object.group];
    } else {
      return GovPropertyColor;
    }
  }

  get payouts(): number[] {
    return this.cell.object.payouts;
  }

  get prefixes(): string[] {
    return this.localization.propertyMods.map(mod =>
      this.localization.getPropertyModPrefix(mod),
    );
  }

  get splitterX(): number {
    return this.localX + this.width * 0.6;
  }

  get topSeparatorY(): number {
    return this.textTopPadding + this.fontSize * 4;
  }
}
