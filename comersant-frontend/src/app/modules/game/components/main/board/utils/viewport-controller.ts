import { BoardCenter } from '../cell/abstract/base';

/**
 * Manages viewport transformations (zoom and pan) for the board
 * Handles its own event listeners lifecycle
 */
export class ViewportController {
  private element: SVGSVGElement | null = null;
  private isPanning = false;
  private lastMouseX = 0;
  private lastMouseY = 0;
  private readonly MaxZoom = 3;
  private readonly MinZoom = 0.5;
  private mouseDownListener: ((event: MouseEvent) => void) | null = null;
  private mouseMoveListener: ((event: MouseEvent) => void) | null = null;
  private mouseUpListener: (() => void) | null = null;
  private panX = 0;
  private panY = 0;
  private readonly ViewportEstimatePx = 800;
  private wheelListener: ((event: WheelEvent) => void) | null = null;
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

  /**
   * Initialize viewport controller with SVG element
   * Sets up all event listeners
   */
  init(element: SVGSVGElement): void {
    this.element = element;

    // Set up document-level event listeners for mouse move and up
    this.mouseMoveListener = (event: MouseEvent) => {
      this.updatePan(event.clientX, event.clientY);
    };

    this.mouseUpListener = () => {
      this.endPan();
    };

    document.addEventListener('mousemove', this.mouseMoveListener);
    document.addEventListener('mouseup', this.mouseUpListener);

    // Set up element-level event listeners for mouse down and wheel
    this.mouseDownListener = (event: MouseEvent) => {
      // Only pan with left mouse button
      if (event.button === 0) {
        this.startPan(event.clientX, event.clientY);
        event.preventDefault();
      }
    };

    this.wheelListener = (event: WheelEvent) => {
      // Only prevent default if zoom actually changes (allows page scroll when at zoom limits)
      if (this.handleWheel(event.deltaY)) {
        event.preventDefault();
      }
    };

    element.addEventListener('mousedown', this.mouseDownListener);
    element.addEventListener('wheel', this.wheelListener);
  }

  /**
   * Clean up all event listeners
   * Should be called when component is destroyed
   */
  destroy(): void {
    // Remove element-level listeners
    if (this.element) {
      if (this.mouseDownListener) {
        this.element.removeEventListener('mousedown', this.mouseDownListener);
        this.mouseDownListener = null;
      }
      if (this.wheelListener) {
        this.element.removeEventListener('wheel', this.wheelListener);
        this.wheelListener = null;
      }
    }

    // Remove document-level listeners
    if (this.mouseMoveListener) {
      document.removeEventListener('mousemove', this.mouseMoveListener);
      this.mouseMoveListener = null;
    }
    if (this.mouseUpListener) {
      document.removeEventListener('mouseup', this.mouseUpListener);
      this.mouseUpListener = null;
    }

    // Clear element reference
    this.element = null;
  }
}
