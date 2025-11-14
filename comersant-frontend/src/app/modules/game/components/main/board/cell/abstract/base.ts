import { Component, Input } from '@angular/core';
import { Board } from '$server/modules/game/models/FieldModels/board';

export const CellHeight = 200;
export const CellWidth = 150;
export const CellOffset = 10;

// Board layout constants
export const BoardCenter = 1500;
// Radius to outer edge of cells (cells form circle at their top edge)
export const OuterRadius = 1050;  // 37 cells: increased to eliminate overlap
export const InnerRadius = 650;   // 23 cells: perfect spacing

@Component({
  selector: 'app-base',
  template: 'temp',
})
export abstract class BaseComponent {
  @Input({ required: true }) orderNumber!: number;

  protected get black() {
    return 'black';
  }

  protected get font() {
    return 'Liberation Mono';
  }

  protected get fontSize() {
    return 17;
  }

  protected get height() {
    return CellHeight;
  }

  protected get lineWidth() {
    return 1;
  }

  protected get offset() {
    return CellOffset;
  }

  protected get padding() {
    return this.offset;
  }

  protected get textPadding() {
    return this.fontSize * 0.2;
  }

  protected get textStartLine() {
    return this.localX + this.textPadding;
  }

  protected get textTopPadding() {
    return this.padding + this.textPadding;
  }

  protected get width() {
    return CellWidth;
  }

  // Local coordinate (for cell content, always 0 since wrapper handles positioning)
  protected get localX(): number {
    return 0;
  }

  // Circular layout properties
  protected get outerCellCount(): number {
    return Board.Cells[0].length;
  }

  protected get innerCellCount(): number {
    return Board.Cells[1].length;
  }

  protected get isOuterRing(): boolean {
    return this.orderNumber < this.outerCellCount;
  }

  protected get ringIndex(): number {
    return this.isOuterRing
      ? this.orderNumber
      : this.orderNumber - this.outerCellCount;
  }

  protected get totalInRing(): number {
    return this.isOuterRing ? this.outerCellCount : this.innerCellCount;
  }

  protected get radius(): number {
    return this.isOuterRing ? OuterRadius : InnerRadius;
  }

  protected get angle(): number {
    const angleStep = (2 * Math.PI) / this.totalInRing;
    return this.ringIndex * angleStep + Math.PI / 2; // Start at bottom (6 o'clock), go clockwise
  }

  protected get x(): number {
    // Position cell CENTER at circular position
    return BoardCenter + this.radius * Math.cos(this.angle) - this.width / 2;
  }

  protected get y(): number {
    // Position cell CENTER at circular position
    return BoardCenter + this.radius * Math.sin(this.angle) - (this.height + this.offset) / 2;
  }

  protected get rotation(): number {
    return (this.angle * 180 / Math.PI) - 90; // Face outward from center
  }

  protected get rotationOriginX(): number {
    return this.width / 2;
  }

  protected get rotationOriginY(): number {
    return (this.height + this.offset) / 2;
  }
}
