import { BoardCenter } from '../cell/abstract/base';

/**
 * Manages viewport transformations (zoom and pan) for the board
 */
export class ViewportController {
  private isPanning = false;
  private lastMouseX = 0;
  private lastMouseY = 0;
  private readonly MaxZoom = 3;
  private readonly MinZoom = 0.5;
  private panX = 0;
  private panY = 0;
  private readonly ViewportEstimatePx = 800;
  private readonly ZoomFactor = 0.9;
  private zoomLevel = 1;

  /**
   * End panning operation
   */
  endPan(): void {
    this.isPanning = false;
  }

  /**
   * Check if currently panning
   */
  getIsPanning(): boolean {
    return this.isPanning;
  }

  /**
   * Calculate SVG viewBox string based on current zoom and pan
   */
  getViewBox(): string {
    const boardSize = BoardCenter * 2;
    const safeZoom = Math.max(0.01, this.zoomLevel);
    const size = boardSize / safeZoom;

    const x = BoardCenter - size / 2 - this.panX;
    const y = BoardCenter - size / 2 - this.panY;
    return `${x} ${y} ${size} ${size}`;
  }

  /**
   * Handle mouse wheel event for zooming
   * @returns true if zoom changed (caller should preventDefault), false otherwise
   */
  handleWheel(deltaY: number): boolean {
    const zoomFactor = deltaY > 0 ? this.ZoomFactor : 1 / this.ZoomFactor;
    const newZoom = this.zoomLevel * zoomFactor;
    const clampedZoom = Math.max(this.MinZoom, Math.min(this.MaxZoom, newZoom));

    if (clampedZoom !== this.zoomLevel) {
      this.zoomLevel = clampedZoom;
      return true;
    }
    return false;
  }

  /**
   * Start panning operation
   */
  startPan(mouseX: number, mouseY: number): void {
    this.isPanning = true;
    this.lastMouseX = mouseX;
    this.lastMouseY = mouseY;
  }

  /**
   * Update pan position during mouse move
   */
  updatePan(mouseX: number, mouseY: number): void {
    if (!this.isPanning) {
      return;
    }

    const boardSize = BoardCenter * 2;
    const viewBoxSize = boardSize / this.zoomLevel;
    const svgToPixelRatio = viewBoxSize / this.ViewportEstimatePx;

    const dx = (mouseX - this.lastMouseX) * svgToPixelRatio;
    const dy = (mouseY - this.lastMouseY) * svgToPixelRatio;

    this.panX += dx;
    this.panY += dy;

    const maxPan = boardSize / 2;
    this.panX = Math.max(-maxPan, Math.min(maxPan, this.panX));
    this.panY = Math.max(-maxPan, Math.min(maxPan, this.panY));

    this.lastMouseX = mouseX;
    this.lastMouseY = mouseY;
  }
}
