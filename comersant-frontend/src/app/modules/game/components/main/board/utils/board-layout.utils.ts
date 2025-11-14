import { Board } from '$server/modules/game/models/FieldModels/board';

import { BoardCenter, InnerRadius, OuterRadius } from '../cell/abstract/base';

export type Position = { x: number; y: number };

function prepareCellAngleAndRadius(cellIndex: number): { angle: number; radius: number } {
  const outerCellCount = Board.Cells[0].length;
  const innerCellCount = Board.Cells[1].length;

  const isOuter = cellIndex < outerCellCount;
  const ringIndex = isOuter ? cellIndex : cellIndex - outerCellCount;
  const total = isOuter ? outerCellCount : innerCellCount;
  const radius = isOuter ? OuterRadius : InnerRadius;

  const angleStep = (2 * Math.PI) / total;
  const angle = ringIndex * angleStep + Math.PI / 2; // Start at bottom (6 o'clock), go clockwise

  return { angle, radius };
}

/**
 * Calculate circular X coordinate for a cell at given index
 */
export function calculateCircularX(cellIndex: number): number {
  const { angle, radius } = prepareCellAngleAndRadius(cellIndex);
  return BoardCenter + radius * Math.cos(angle);
}

/**
 * Calculate circular Y coordinate for a cell at given index
 */
export function calculateCircularY(cellIndex: number): number {
  const { angle, radius } = prepareCellAngleAndRadius(cellIndex);
  return BoardCenter + radius * Math.sin(angle);
}

export function calculateCircularXByAngleAndRadius(angle: number, radius: number): number {
  return BoardCenter + radius * Math.cos(angle);
}
export function calculateCircularYByAngleAndRadius(angle: number, radius: number): number {
  return BoardCenter + radius * Math.sin(angle);
}

export function calculateCircularPosition(cellIndex: number): Position {
  const { angle, radius } = prepareCellAngleAndRadius(cellIndex);
  return {
    x: calculateCircularXByAngleAndRadius(angle, radius),
    y: calculateCircularYByAngleAndRadius(angle, radius),
  };
}
