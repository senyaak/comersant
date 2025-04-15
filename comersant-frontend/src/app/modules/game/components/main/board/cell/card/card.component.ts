import { Component, Input, OnInit } from '@angular/core';
import {
  CardEventCell,
  EventCell,
} from '$server/modules/game/models/FieldModels/cells';

import { BaseComponent } from '../abstract/base';

@Component({
  selector: '[app-card-cell]',
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  standalone: false,
})
export class CardComponent extends BaseComponent implements OnInit {
  @Input({ required: true }) cell!: EventCell;

  public label?: string;
  public color: string = 'black';

  public positionY: number = this.offset + this.height * 0.75;

  ngOnInit() {
    if (this.cell instanceof CardEventCell) {
      console.log('-> ', this, this.cell.name, this.cell.type);
      this.label = this.cell.type;
    } else {
      console.log(this.cell);
      throw new Error('HANDLE OTHER EVENT ');
    }
  }
}
