import { EventType } from '$server/modules/game/models/events';
import { Board } from '$server/modules/game/models/FieldModels/board';
import {
  CardEventCell,
  Cell,
  PropertyCell,
  StartCell,
  StaticEventCell,
} from '$server/modules/game/models/FieldModels/cells';
import { AreaSite } from '$server/modules/game/models/GameModels/properties';
import { Component, OnInit } from '@angular/core';
import { CellHeight, CellOffset, CellWidth } from './cell/abstract/base';

// import { SVG } from '@svgdotjs/svg.js';
@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit {
  // @ViewChild('svgContainer') svgContainer!: ElementRef;
  board: Board = new Board();
  viewBox: string;

  constructor() {
    this.viewBox = `0 0 ${this.boardWidthC} ${this.boardHeightC}`;
  }

  ngOnInit() {
    console.log('2board', this.board.cells);
  }

  get boardWidth() {
    return '50%';
  }
  get boardWidthC() {
    return this.board.cells.length * (CellWidth + CellOffset) + CellOffset;
  }
  get boardHeightC() {
    return CellHeight + CellOffset * 2;
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
    } else if (item instanceof StaticEventCell) {
      return 'StaticEventCell';
    }

    // console.log('item', item);
    throw new Error('dmb');
  }
}
