import { Component, Input, OnInit } from '@angular/core';
import { PropertyCell } from '$server/modules/game/models/FieldModels/cells';
import { AreaSite } from '$server/modules/game/models/GameModels/properties';

import { BaseComponent } from '../abstract/base';

@Component({
  selector: '[app-area-cell]',
  templateUrl: './area.component.html',
  styleUrl: './area.component.scss',
  standalone: false,
})
export class AreaComponent extends BaseComponent implements OnInit {
  @Input({ required: true }) cell!: PropertyCell<AreaSite>;

  get color() {
    return 'red';
  }

  ngOnInit(): void {
    console.log('init income');
  }
}
