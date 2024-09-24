import { Component, Input } from '@angular/core';

export const CellHeight = 200;
export const CellWidth = 150;
export const CellOffset = 10;

@Component({
  selector: 'app-base',
  template: 'temp',
})
export abstract class BaseComponent {
  @Input({ required: true }) orderNumber!: number;
  protected get height() {
    return CellHeight;
  }
  protected get width() {
    return CellWidth;
  }
  protected get offset() {
    return CellOffset;
  }
  protected get x() {
    return this.offset + this.orderNumber * (this.width + this.offset);
  }
  protected get fontSize() {
    return 20;
  }
  protected get padding() {
    return 15;
  }
  protected get font() {
    return 'Verdana';
  }
  protected get black() {
    return 'black';
  }
}
