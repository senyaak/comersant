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
  // protected get textTopPadding() {
  //   return this.padding + this.textPadding;
  // }
  protected get textStartLine() {
    return this.x + this.textPadding;
  }
  protected get textTopPadding() {
    return this.padding + this.textPadding;
  }
  protected get textPadding() {
    return this.fontSize * 0.2;
  }
  protected get fontSize() {
    return 17;
  }
  protected get padding() {
    return this.offset;
  }
  protected get lineWidth() {
    return 1;
  }
  protected get font() {
    return 'Liberation Mono';
  }
  protected get black() {
    return 'black';
  }
}
