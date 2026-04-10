import { Board } from '../../../FieldModels/board';
import { TaxServiceCell } from '../../../FieldModels/cells';
import {
  computeMove,
  computeMoveToCellName,
  computeMoveToPosition,
  computeMoveToTaxService,
} from './movement';

describe('computeMove', () => {
  it('returns a single PLAYER_MOVED effect with the given playerIndex and step count', () => {
    expect(computeMove(2, 5)).toEqual([
      { type: 'PLAYER_MOVED', playerIndex: 2, steps: 5 },
    ]);
  });
});

describe('computeMoveToPosition', () => {
  it('returns a single PLAYER_MOVED_TO_POSITION effect with the supplied target', () => {
    expect(computeMoveToPosition(1, 17)).toEqual([
      { type: 'PLAYER_MOVED_TO_POSITION', playerIndex: 1, targetPosition: 17 },
    ]);
  });
});

describe('computeMoveToTaxService', () => {
  it('finds the TaxServiceCell index in the flat board and emits PLAYER_MOVED_TO_POSITION', () => {
    const flatCells = new Board().flatCells;
    const expected = flatCells.findIndex(c => TaxServiceCell.isTaxServiceCell(c));

    expect(computeMoveToTaxService(0, flatCells)).toEqual([
      { type: 'PLAYER_MOVED_TO_POSITION', playerIndex: 0, targetPosition: expected },
    ]);
  });
});

describe('computeMoveToCellName', () => {
  it('resolves the cell name via Board.getTargetPosition and emits PLAYER_MOVED_TO_POSITION', () => {
    const flatCells = new Board().flatCells;
    const namedCell = flatCells.find(c => c.name === 'Start') ?? flatCells[0];

    expect(computeMoveToCellName(3, namedCell.name)).toEqual([
      {
        type: 'PLAYER_MOVED_TO_POSITION',
        playerIndex: 3,
        targetPosition: Board.getTargetPosition(namedCell.name),
      },
    ]);
  });
});
