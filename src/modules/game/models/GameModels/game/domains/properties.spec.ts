import { Board } from '../../../FieldModels/board';
import { PropertyCell } from '../../../FieldModels/cells';
import { Business, BusinessGrade } from '../../properties';
import { computeBuyProperty, computeLoseProperty, computePropertyStep } from './properties';

const propertyIndex = (board: Board): number =>
  board.flatCells.findIndex(PropertyCell.isPropertyCell);

const businessIndex = (board: Board, grade: BusinessGrade): number =>
  board.flatCells.findIndex(c =>
    PropertyCell.isPropertyCell(c) && Business.isBusiness(c.object) && c.object.grade === grade,
  );

describe('computePropertyStep', () => {
  let board: Board;
  let cell: PropertyCell;
  let index: number;

  beforeEach(() => {
    board = new Board();
    index = propertyIndex(board);
    cell = board.flatCells[index] as PropertyCell;
    cell.object.owner = null;
  });

  it('returns TAX_PAID with the cell tax when the property is owned by another player', () => {
    cell.object.owner = 'other-player';
    expect(computePropertyStep(cell, 'me', 0, index)).toEqual([
      { type: 'TAX_PAID', fromPlayerIndex: 0, toPlayerId: 'other-player', amount: cell.object.tax },
    ]);
  });

  it('returns PROPERTY_OFFERED with the cell price when the property has no owner', () => {
    expect(computePropertyStep(cell, 'me', 2, index)).toEqual([
      { type: 'PROPERTY_OFFERED', playerIndex: 2, propertyIndex: index, price: cell.object.price },
    ]);
  });

  it('returns an empty effect list when the current player already owns the property', () => {
    cell.object.owner = 'me';
    expect(computePropertyStep(cell, 'me', 0, index)).toEqual([]);
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
});
