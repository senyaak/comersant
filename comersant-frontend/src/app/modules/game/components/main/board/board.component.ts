import { Component, HostListener, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { EventType } from '$server/modules/game/models/events';
import { Board } from '$server/modules/game/models/FieldModels/board';
import {
  CardEventCell,
  Cell,
  InnerStartCell,
  InteractiveEventCell,
  PropertyCell,
  StartCell,
  StaticEventCell,
} from '$server/modules/game/models/FieldModels/cells';
import { AreaSite } from '$server/modules/game/models/GameModels/properties';

import { GameService } from '../../../services/game.service';
import { BoardCenter, CellHeight, CellOffset, CellWidth } from './cell/abstract/base';

// import { SVG } from '@svgdotjs/svg.js';
@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
  standalone: false,
})
export class BoardComponent implements OnInit, OnChanges, OnDestroy {
  public board!: Board;

  // Zoom and pan constants
  private readonly MIN_ZOOM = 0.5;
  private readonly MAX_ZOOM = 3;
  private readonly ZOOM_FACTOR = 0.9;
  private readonly VIEWPORT_ESTIMATE_PX = 800; // Approximate viewport size for pan calculation

  // Zoom and pan state
  zoomLevel = 1;
  panX = 0;
  panY = 0;
  isPanning = false;
  lastMouseX = 0;
  lastMouseY = 0;

  // Event listener references for cleanup
  private mouseMoveListener: ((event: MouseEvent) => void) | null = null;
  private mouseUpListener: (() => void) | null = null;

  constructor(private gameService: GameService) {}

  ngOnChanges() {
    console.log('BoardComponent changes detected');
  }

  ngOnInit() {
    this.board = this.gameService.Game.board;
    // TODO: restore board state if needed
    console.log('2board', this.flatCells);

    // Manually add document listeners to ensure proper cleanup
    this.mouseMoveListener = this.onMouseMove.bind(this);
    this.mouseUpListener = this.onMouseUp.bind(this);

    document.addEventListener('mousemove', this.mouseMoveListener);
    document.addEventListener('mouseup', this.mouseUpListener);
  }

  ngOnDestroy() {
    // Clean up document event listeners
    if (this.mouseMoveListener) {
      document.removeEventListener('mousemove', this.mouseMoveListener);
    }
    if (this.mouseUpListener) {
      document.removeEventListener('mouseup', this.mouseUpListener);
    }
  }

  get Board() {
    return this.board;
  }

  get boardHeightC() {
    return CellHeight + CellOffset * 2;
  }

  get boardWidthC() {
    return this.flatCells.length * (CellWidth + CellOffset) + CellOffset;
  }

  get boardWidthScale() {
    return '100%';
  }

  get flatCells() {
    return this.board.cells.flat();
  }

  get viewBox(): string {
    // Dynamic viewBox for zoom/pan centered on circular board
    const boardSize = BoardCenter * 2;
    // Safety check to prevent division by zero
    const safeZoom = Math.max(0.01, this.zoomLevel);
    const size = boardSize / safeZoom;

    // Center viewBox on board center, then apply pan offset
    const x = BoardCenter - size/2 - this.panX;
    const y = BoardCenter - size/2 - this.panY;
    return `${x} ${y} ${size} ${size}`;
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent): void {
    const zoomFactor = event.deltaY > 0 ? this.ZOOM_FACTOR : 1 / this.ZOOM_FACTOR;
    const newZoom = this.zoomLevel * zoomFactor;
    const clampedZoom = Math.max(this.MIN_ZOOM, Math.min(this.MAX_ZOOM, newZoom));

    // Only prevent default if zoom actually changes (allows page scroll when at zoom limits)
    if (clampedZoom !== this.zoomLevel) {
      event.preventDefault();
      this.zoomLevel = clampedZoom;
    }
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    // Only pan with left mouse button
    if (event.button === 0) {
      this.isPanning = true;
      this.lastMouseX = event.clientX;
      this.lastMouseY = event.clientY;
      event.preventDefault();
    }
  }

  onMouseUp(): void {
    this.isPanning = false;
  }

  onMouseMove(event: MouseEvent): void {
    if (this.isPanning) {
      // Convert pixel delta to SVG units (inversely proportional to zoom)
      const boardSize = BoardCenter * 2;
      const viewBoxSize = boardSize / this.zoomLevel;

      // Approximate conversion factor (assumes square viewport)
      const svgToPixelRatio = viewBoxSize / this.VIEWPORT_ESTIMATE_PX;

      const dx = (event.clientX - this.lastMouseX) * svgToPixelRatio;
      const dy = (event.clientY - this.lastMouseY) * svgToPixelRatio;

      this.panX += dx;
      this.panY += dy;

      // Clamp pan to keep board mostly visible
      const maxPan = boardSize / 2;
      this.panX = Math.max(-maxPan, Math.min(maxPan, this.panX));
      this.panY = Math.max(-maxPan, Math.min(maxPan, this.panY));

      this.lastMouseX = event.clientX;
      this.lastMouseY = event.clientY;
    }
  }

  getType(item: Cell) {
    if (item instanceof StartCell) {
      return 'StartCell';
    } else if (item instanceof PropertyCell) {
      if (item.object instanceof AreaSite) {
        return 'AreaSite';
      } else {
        return 'Property';
      }
    } else if (item instanceof CardEventCell) {
      return 'CardEventCell';
    } else if (
      item instanceof StaticEventCell &&
      item.type === EventType.BalanceChange
    ) {
      if (item.amount! > 0) {
        return 'IncomeCell';
      } else {
        return 'TaxCell';
      }
    } else if (
      item instanceof InteractiveEventCell &&
      item.type === EventType.MoveToCenter
    ) {
      return 'MoveToCenter';
    } else if (item instanceof InteractiveEventCell && item.type === EventType.Raccito) {
      return 'Raccito';
    } else if (item instanceof StaticEventCell && item.type === EventType.SkipTurn) {
      return 'SkipTurn';
    } else if (item instanceof InnerStartCell) {
      return 'InnerStartCell';
    } else if (item instanceof StaticEventCell && item.type === EventType.TaxService) {
      return 'TaxService';
    }

    console.log('item', item);
    throw new Error('dmb');
    return 'unknown';
  }
}
