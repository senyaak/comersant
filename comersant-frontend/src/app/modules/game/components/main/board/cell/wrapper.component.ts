import { Component, Input } from '@angular/core';

import { BaseComponent } from './abstract/base';

@Component({
  selector: '[app-cell-wrapper]',
  templateUrl: './wrapper.component.html',
  styleUrls: ['./wrapper.component.scss'],
  standalone: false,
})
export class CellWrapperComponent extends BaseComponent {
  @Input({ required: false }) fill?: string = 'white';
  @Input({ required: false }) static?: boolean = false;
  viewBox: string = `0 0 ${this.width} ${this.height}`;

  override get rotation(): number {
    return this.static ? 0 : super.rotation;
  }

  override get x(): number {
    return this.static ? 0 : super.x;
  }

  override get y(): number {
    return this.static ? 0 : super.y;
  }
}
