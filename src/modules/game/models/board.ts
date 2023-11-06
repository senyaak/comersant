import { Cell, CellStart } from './cells';

export class Board {
  cells: Cell[];
  constructor() {
    this.cells = [new CellStart()];
  }
}
