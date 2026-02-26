import { Board } from '../../../FieldModels/board';
import { Cell, TaxServiceCell } from '../../../FieldModels/cells';

export type MovementEffect =
  | { type: 'PLAYER_MOVED'; playerIndex: number; steps: number }
  | { type: 'PLAYER_MOVED_TO_POSITION'; playerIndex: number; targetPosition: number };

export function computeMove(playerIndex: number, steps: number): MovementEffect[] {
  return [{ type: 'PLAYER_MOVED', playerIndex, steps }];
}

export function computeMoveToTaxService(playerIndex: number, flatCells: Cell[]): MovementEffect[] {
  const targetPosition = flatCells.findIndex(cell => TaxServiceCell.isTaxServiceCell(cell));
  return [{ type: 'PLAYER_MOVED_TO_POSITION', playerIndex, targetPosition }];
}

export function computeMoveToPosition(playerIndex: number, targetPosition: number): MovementEffect[] {
  return [{ type: 'PLAYER_MOVED_TO_POSITION', playerIndex, targetPosition }];
}

export function computeMoveToCellName(playerIndex: number, cellName: Cell['name']): MovementEffect[] {
  const targetPosition = Board.getTargetPosition(cellName);
  return [{ type: 'PLAYER_MOVED_TO_POSITION', playerIndex, targetPosition }];
}
