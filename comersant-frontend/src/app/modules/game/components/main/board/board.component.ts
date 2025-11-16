import { AfterViewInit, Component, ElementRef, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
export class BoardComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('boardSvg', { static: false }) boardSvgRef!: ElementRef<SVGSVGElement>;

  private readonly viewport = new ViewportController();
  public board!: Board;

  constructor(private gameService: GameService) {}

  ngOnChanges() {
    console.log('BoardComponent changes detected');
  }

  ngAfterViewInit() {
    // Initialize viewport controller with SVG element
    this.viewport.init(this.boardSvgRef.nativeElement);
  }

  ngOnDestroy() {
    // Clean up viewport controller
    this.viewport.destroy();
  }

  ngOnInit() {
    this.board = this.gameService.Game.board;
    // TODO: restore board state if needed
    console.log('2board', this.flatCells);
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
}
