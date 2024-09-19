import { PropertyCell } from '$server/modules/game/models/FieldModels/cells';
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
  @Input({ required: true }) cell!: PropertyCell;

  public label?: string;

  constructor(private translate: TranslateService) {
    super();
  }

  async ngOnInit() {
    this.label = await firstValueFrom(this.translate.get(this.cell.name));
  }
}
