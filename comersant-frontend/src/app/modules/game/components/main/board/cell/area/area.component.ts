import { PropertyCell } from '$server/modules/game/models/FieldModels/cells';
import { AreaSite } from '$server/modules/game/models/GameModels/properties';
import { Component, Input, OnInit } from '@angular/core';
import { BaseComponent } from '../abstract/base';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[app-area-cell]',
  templateUrl: './area.component.html',
  styleUrl: './area.component.scss',
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
