import { Board } from '../../../FieldModels/board';
import { PropertyCell } from '../../../FieldModels/cells';
import { AreaSite, Business, BusinessGrade } from '../../properties';
import { computeBuyProperty, computeLoseProperty, computePropertyStep } from './properties';

const propertyIndex = (board: Board): number =>
  board.flatCells.findIndex(PropertyCell.isPropertyCell);

const businessIndex = (board: Board, grade: BusinessGrade): number =>
  board.flatCells.findIndex(c =>
    PropertyCell.isPropertyCell(c) && Business.isBusiness(c.object) && c.object.grade === grade,
  );

describe('computePropertyStep', () => {
  // Hand-built PropertyCell with known price (1000) → known tax (100 via AreaSite formula).
  // Prices and taxes are hard-coded so the test is independent of the real board layout
  // and catches any drift in how computePropertyStep reads the cell.
  const buildCell = (owner: string | null = null): PropertyCell => {
    const property = new AreaSite(1000, owner);
    return new PropertyCell('Site' as never, property);
  };
  const PROP_INDEX = 7;

  it('returns TAX_PAID with the hard-coded tax amount when another player owns the property', () => {
    const cell = buildCell('other-player');
    expect(computePropertyStep(cell, 'me', 0, PROP_INDEX)).toEqual([
      { type: 'TAX_PAID', fromPlayerIndex: 0, toPlayerId: 'other-player', amount: 100 },
    ]);
  });

  it('returns PROPERTY_OFFERED with the hard-coded price when the property has no owner', () => {
    const cell = buildCell(null);
    expect(computePropertyStep(cell, 'me', 2, PROP_INDEX)).toEqual([
      { type: 'PROPERTY_OFFERED', playerIndex: 2, propertyIndex: PROP_INDEX, price: 1000 },
    ]);
  });

  it('returns an empty effect list when the current player already owns the property', () => {
    const cell = buildCell('me');
    expect(computePropertyStep(cell, 'me', 0, PROP_INDEX)).toEqual([]);
  });

  it('identifies ownership by player id, not by player index', () => {
    // Regression guard: if the check were "cell.owner === currentPlayerIndex"
    // (a plausible mistake), this would still return TAX_PAID for a non-zero index.
    const cell = buildCell('me');
    expect(computePropertyStep(cell, 'me', 2, PROP_INDEX)).toEqual([]);
  });
});

describe('computeBuyProperty', () => {
  let board: Board;
  let index: number;
  let cell: PropertyCell;
  const players = [
    { Id: 'p1', Money: 200_000 },
    { Id: 'p2', Money: 100 },
  ];

  beforeEach(() => {
    board = new Board();
    index = propertyIndex(board);
    cell = board.flatCells[index] as PropertyCell;
    cell.object.owner = null;
  });

  it('throws when the buyer is not in the players list', () => {
    expect(() => computeBuyProperty(players, board.flatCells, 'unknown', index, 100))
      .toThrow('Player not found');
  });

  it('throws when the resolved cell is not a PropertyCell', () => {
    const nonPropertyIndex = board.flatCells.findIndex(c => !PropertyCell.isPropertyCell(c));
    expect(() => computeBuyProperty(players, board.flatCells, 'p1', nonPropertyIndex, 100))
      .toThrow('Current cell is not a property');
  });

  it('throws when the buyer already owns the property', () => {
    cell.object.owner = 'p1';
    expect(() => computeBuyProperty(players, board.flatCells, 'p1', index, cell.object.price))
      .toThrow('already owned');
  });

  it('throws when the buyer has insufficient funds', () => {
    expect(() => computeBuyProperty(players, board.flatCells, 'p2', index, cell.object.price))
      .toThrow('Insufficient funds');
  });

  it('returns PROPERTY_PURCHASED with previousOwnerId=null for an unowned property', () => {
    expect(computeBuyProperty(players, board.flatCells, 'p1', index, cell.object.price)).toEqual([{
      type: 'PROPERTY_PURCHASED',
      buyerPlayerId: 'p1',
      propertyIndex: index,
      price: cell.object.price,
      previousOwnerId: null,
    }]);
  });

  it('returns PROPERTY_PURCHASED carrying the previous owner id when re-buying', () => {
    cell.object.owner = 'p2';
    const [effect] = computeBuyProperty(players, board.flatCells, 'p1', index, cell.object.price);
    expect(effect).toMatchObject({ type: 'PROPERTY_PURCHASED', previousOwnerId: 'p2' });
  });

  it('allows a purchase when the buyer has exactly the price (boundary)', () => {
    const price = cell.object.price;
    const exactBuyer = [{ Id: 'p1', Money: price }];
    const effects = computeBuyProperty(exactBuyer, board.flatCells, 'p1', index, price);
    expect(effects).toEqual([{
      type: 'PROPERTY_PURCHASED',
      buyerPlayerId: 'p1',
      propertyIndex: index,
      price,
      previousOwnerId: null,
    }]);
  });
});

describe('computeLoseProperty', () => {
  let board: Board;

  beforeEach(() => { board = new Board(); });

  it('returns PROPERTY_LOST with propertyIndex=null when the player owns nothing of the requested grade', () => {
    expect(computeLoseProperty(board.flatCells, 'p1', BusinessGrade.Office)).toEqual([
      { type: 'PROPERTY_LOST', propertyIndex: null },
    ]);
  });

  it('returns PROPERTY_LOST with the index of an owned property of the requested grade', () => {
    const idx = businessIndex(board, BusinessGrade.Area);
    const cell = board.flatCells[idx] as PropertyCell<Business>;
    cell.object.owner = 'p1';
    cell.object.grade = BusinessGrade.Office;

    const [effect] = computeLoseProperty(board.flatCells, 'p1', BusinessGrade.Office);
    expect(effect).toEqual({ type: 'PROPERTY_LOST', propertyIndex: idx });
  });

  it('only considers properties owned by the current player', () => {
    const idx = businessIndex(board, BusinessGrade.Area);
    const cell = board.flatCells[idx] as PropertyCell<Business>;
    cell.object.owner = 'someone-else';
    cell.object.grade = BusinessGrade.Office;

    expect(computeLoseProperty(board.flatCells, 'p1', BusinessGrade.Office)).toEqual([
      { type: 'PROPERTY_LOST', propertyIndex: null },
    ]);
  });

  it('only considers Business cells whose grade matches the request (Enterprise vs Office)', () => {
    const idx = businessIndex(board, BusinessGrade.Area);
    const cell = board.flatCells[idx] as PropertyCell<Business>;
    cell.object.owner = 'p1';
    cell.object.grade = BusinessGrade.Office;

    expect(computeLoseProperty(board.flatCells, 'p1', BusinessGrade.Enterprise)).toEqual([
      { type: 'PROPERTY_LOST', propertyIndex: null },
    ]);
  });

  it('picks exactly one index from the set of owned matching properties', () => {
    // Own three Business cells and mark them all as Office grade
    const businessIdxs = board.flatCells
      .map((c, i) => ({ c, i }))
      .filter(({ c }) => PropertyCell.isPropertyCell(c) && Business.isBusiness(c.object))
      .slice(0, 3)
      .map(({ i }) => i);

    for (const i of businessIdxs) {
      const c = board.flatCells[i] as PropertyCell<Business>;
      c.object.owner = 'p1';
      c.object.grade = BusinessGrade.Office;
    }

    const effects = computeLoseProperty(board.flatCells, 'p1', BusinessGrade.Office);
    expect(effects).toHaveLength(1);
    const [effect] = effects;
    expect(effect.type).toBe('PROPERTY_LOST');
    if (effect.type === 'PROPERTY_LOST') {
      expect(businessIdxs).toContain(effect.propertyIndex);
    }
  });
});
