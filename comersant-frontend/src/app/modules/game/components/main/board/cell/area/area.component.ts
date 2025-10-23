import { Component, Input, OnInit } from '@angular/core';
import { PropertyCell } from '$server/modules/game/models/FieldModels/cells';
import { AreaSite } from '$server/modules/game/models/GameModels/properties';
import { GameService } from 'src/app/modules/game/services/game.service';

import { Asset } from '../abstract/asset';

@Component({
  selector: '[app-area-cell]',
  templateUrl: './area.component.html',
  styleUrl: './area.component.scss',
  standalone: false,
})
export class AreaComponent extends Asset implements OnInit {
  @Input({ required: true }) cell!: PropertyCell<AreaSite>;

  constructor(protected gameService: GameService) {
    super();
  }

  ngOnInit(): void {
  }

  get color() {
    return 'red';
  }
}
