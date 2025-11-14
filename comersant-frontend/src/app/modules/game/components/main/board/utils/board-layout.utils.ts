import { Board } from '$server/modules/game/models/FieldModels/board';
import { BOARD_CENTER, INNER_RADIUS, OUTER_RADIUS } from '../cell/abstract/base';

export type Position = { x: number; y: number };

export const ANIMATION_STEP_MS = 150;
export const PLAYER_OFFSET_PX = 10;

/**
 * Calculate the circular position for a cell at given index
 */
export function calculateCircularPosition(cellIndex: number): Position {
  const outerCellCount = Board.Cells[0].length;
  const innerCellCount = Board.Cells[1].length;

  const isOuter = cellIndex < outerCellCount;
  const ringIndex = isOuter ? cellIndex : cellIndex - outerCellCount;
  const total = isOuter ? outerCellCount : innerCellCount;
  const radius = isOuter ? OUTER_RADIUS : INNER_RADIUS;

  const angleStep = (2 * Math.PI) / total;
  const angle = ringIndex * angleStep + Math.PI / 2; // Start at bottom (6 o'clock), go clockwise

  return {
    x: BOARD_CENTER + radius * Math.cos(angle),
    y: BOARD_CENTER + radius * Math.sin(angle)
  };
}
