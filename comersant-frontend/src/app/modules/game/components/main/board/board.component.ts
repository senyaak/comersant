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
import { CellHeight, CellOffset, CellWidth } from './cell/abstract/base';
import { ViewportController } from './utils/viewport-controller';

// import { SVG } from '@svgdotjs/svg.js';
@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
  standalone: false,
})
export class BoardComponent implements OnInit, OnChanges, OnDestroy {
  // Event listener references for cleanup
  private mouseMoveListener: ((event: MouseEvent) => void) | null = null;
  private mouseUpListener: (() => void) | null = null;

  private readonly viewport = new ViewportController();
  public board!: Board;

  constructor(private gameService: GameService) {}

  ngOnChanges() {
    console.log('BoardComponent changes detected');
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
    return this.viewport.getViewBox();
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
      if (item.amount !== undefined) {
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
    throw new Error('the cell type is not recognized');
    return 'unknown';
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    // Only pan with left mouse button
    if (event.button === 0) {
      this.viewport.startPan(event.clientX, event.clientY);
      event.preventDefault();
    }
  }

  onMouseMove(event: MouseEvent): void {
    this.viewport.updatePan(event.clientX, event.clientY);
  }

  onMouseUp(): void {
    this.viewport.endPan();
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent): void {
    // Only prevent default if zoom actually changes (allows page scroll when at zoom limits)
    if (this.viewport.handleWheel(event.deltaY)) {
      event.preventDefault();
    }
  }
}
