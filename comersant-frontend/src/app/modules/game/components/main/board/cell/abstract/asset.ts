import { Component } from '@angular/core';
import { PropertyCell } from '$server/modules/game/models/FieldModels/cells';
import { AreaSite, Business } from '$server/modules/game/models/GameModels/properties';
import { GameService } from 'src/app/modules/game/services/game.service';

import { BaseComponent } from './base';

@Component({
  selector: 'app-asset',
  template: 'temp',
})
export abstract class Asset extends BaseComponent {
  abstract cell: PropertyCell<Business | AreaSite>;
  protected abstract gameService: GameService

  get cellOwned(): boolean {
    return this.cell.object.owner !== null;
  }

  get extraPadding() {
    return 10;
  }

  get ownerColor(): string {
    const owner = this.gameService.Game.players.find(p => p.Id === this.cell.object.owner);
    if(!owner) {
      throw new Error('Owner not found');
    }

    return owner.Color;
  }

  get ownerMarkRadius(): number {
    return 10;
  }

  get ownerX(): number {
    return this.localX + this.width - this.ownerMarkRadius - this.extraPadding;
  }

  get ownerY(): number {
    return this.height - this.ownerMarkRadius;
  }

}
