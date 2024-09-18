import { Board } from '$server/modules/game/models/FieldModels/board';
import {
  Cell,
  PropertyCell,
  StartCell,
} from '$server/modules/game/models/FieldModels/cells';
import {
  GovBussines,
  PrivateBussines,
  Site,
} from '$server/modules/game/models/GameModels/properties';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { CellHeight, CellOffset, CellWidth } from './cell/abstract/base';

// import { SVG } from '@svgdotjs/svg.js';
@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements AfterViewInit {
  @ViewChild('svgContainer') svgContainer!: ElementRef;
  board: Board = new Board();
  viewBox: string;

  constructor() {
    this.viewBox = `0 0 ${this.boardWidth} ${this.boardHeight}`;
  }

  ngAfterViewInit() {
    console.log('test', this.svgContainer.nativeElement);
    console.log('2board', this.board.cells);
    // const draw = SVG()
    //   .addTo(this.svgContainer.nativeElement)
    //   .size('100%', '100%');
    // const rect = draw.rect(100, 100).attr({ fill: '#f06' });
    // rect.node.addEventListener('click', () => {
    //   // this.someAngularMethod();
    // });
  }

  get boardWidth() {
    return this.board.cells.length * (CellWidth + CellOffset) + CellOffset;
  }
  get boardHeight() {
    return CellHeight + CellOffset * 2;
  }
  getType(item: Cell) {
    if (item instanceof StartCell) {
      return 'StartCell';
    } else if (item instanceof PropertyCell) {
      if (item.object instanceof PrivateBussines) {
        return 'PrivateBussines';
      } else if (item.object instanceof Site) {
        return 'Site';
      } else if (item.object instanceof GovBussines) {
        return 'GovBussines';
      } else {
        throw new Error('dmb ass');
      }
    }

    throw new Error('dmb');
  }
}
