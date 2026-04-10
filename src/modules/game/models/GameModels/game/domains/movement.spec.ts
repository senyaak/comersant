import { Cell, StartCell, TaxServiceCell } from '../../../FieldModels/cells';
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
  // Hand-built cell array: we know exactly where the TaxServiceCell sits (index 2),
  // so the expected targetPosition is independent of what the production function
  // does internally.
  const fakeCells = (): Cell[] => [
    new StartCell(),
    new StartCell(),
    new TaxServiceCell(),
    new StartCell(),
  ];

  it('targets the TaxServiceCell at its known index', () => {
    expect(computeMoveToTaxService(0, fakeCells())).toEqual([
      { type: 'PLAYER_MOVED_TO_POSITION', playerIndex: 0, targetPosition: 2 },
    ]);
  });

  it('targets -1 when no TaxServiceCell is present', () => {
    const noTax: Cell[] = [new StartCell(), new StartCell()];
    expect(computeMoveToTaxService(0, noTax)).toEqual([
      { type: 'PLAYER_MOVED_TO_POSITION', playerIndex: 0, targetPosition: -1 },
    ]);
  });
});

describe('computeMoveToCellName', () => {
  it('targets the "Start" cell at its known position on the real board', () => {
    // Start is the first cell of the outer ring, at index 0 of flatCells.
    // Hard-coded on purpose so the test fails loudly if Board layout changes.
    expect(computeMoveToCellName(3, 'Start')).toEqual([
      { type: 'PLAYER_MOVED_TO_POSITION', playerIndex: 3, targetPosition: 0 },
    ]);
  });
});
