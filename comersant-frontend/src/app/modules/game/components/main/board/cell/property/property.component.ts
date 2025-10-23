import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PropertyMods } from '$i18n/mapping';
import { GovPropertyColor, PropertyGroupsColors } from '$server/modules/game/models/FieldModels/board';
import { PropertyCell } from '$server/modules/game/models/FieldModels/cells';
import { Business, PrivateBusiness } from '$server/modules/game/models/GameModels/properties';
import { firstValueFrom } from 'rxjs';
import { GameService } from 'src/app/modules/game/services/game.service';

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

  constructor(private translate: TranslateService, private gameService: GameService) {
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

  get cellColor() {
    if(PrivateBusiness.isPrivateBusiness(this.cell.object)) {
      return PropertyGroupsColors[this.cell.object.group];
    } else {
      return GovPropertyColor;
    }
  }

  get cellOwned(): boolean {
    console.log('owner check:', this.cell, this.cell.name, this.cell.object.owner);
    return this.cell.object.owner !== null;
  }

  get extraPadding() {
    return 10;
  }

  get ownerColor(): string {
    return this.gameService.Game.players.find(p => p.Id === this.cell.object.owner)!.Color;
  }

  get ownerMarkRadius(): number {
    return 10;
  }

  get ownerX(): number {
    return this.x + this.width - this.ownerMarkRadius - this.extraPadding;
  }

  get ownerY(): number {
    return this.height - this.ownerMarkRadius;
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
