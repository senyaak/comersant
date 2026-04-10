import { Cell, PropertyCell } from '../../../FieldModels/cells';
import {
  InsufficientFundsError,
  NotAPropertyCellError,
  PlayerNotFoundError,
  PropertyAlreadyOwnedError,
} from '../../errors';
import { Business, BusinessGrade } from '../../properties';

export type PropertyEffect =
  | { type: 'PROPERTY_OFFERED'; playerIndex: number; propertyIndex: number; price: number }
  | { type: 'TAX_PAID'; fromPlayerIndex: number; toPlayerId: string; amount: number }
  | {
      type: 'PROPERTY_PURCHASED';
      buyerPlayerId: string;
      propertyIndex: number;
      price: number;
      previousOwnerId: string | null
    }
  | { type: 'PROPERTY_LOST'; propertyIndex: number | null };

export function computePropertyStep(
  cell: PropertyCell,
  currentPlayerId: string,
  currentPlayerIndex: number,
  propertyIndex: number,
): PropertyEffect[] {
  if (cell.object.owner && cell.object.owner !== currentPlayerId) {
    return [{
      type: 'TAX_PAID',
      fromPlayerIndex: currentPlayerIndex,
      toPlayerId: cell.object.owner,
      amount: cell.object.tax,
    }];
  }
  if (cell.object.owner === null) {
    return [{
      type: 'PROPERTY_OFFERED',
      playerIndex: currentPlayerIndex,
      propertyIndex,
      price: cell.object.price,
    }];
  }
  return [];
}

export function computeBuyProperty(
  players: ReadonlyArray<{ Id: string; Money: number }>,
  flatCells: Cell[],
  playerId: string,
  propertyIndex: number,
  price: number,
): PropertyEffect[] {
  const buyer = players.find(p => p.Id === playerId);
  if (!buyer) throw new PlayerNotFoundError(playerId);

  const cell = flatCells[propertyIndex];
  if (!PropertyCell.isPropertyCell(cell)) throw new NotAPropertyCellError(propertyIndex);
  if (cell.object.owner === playerId) throw new PropertyAlreadyOwnedError(playerId);
  if (buyer.Money < price) throw new InsufficientFundsError();

  return [{
    type: 'PROPERTY_PURCHASED',
    buyerPlayerId: playerId,
    propertyIndex,
    price,
    previousOwnerId: cell.object.owner,
  }];
}

export function computeLoseProperty(
  flatCells: Cell[],
  currentPlayerId: string,
  grade: BusinessGrade.Enterprise | BusinessGrade.Office,
): PropertyEffect[] {
  const validProps = flatCells
    .filter((cell): cell is PropertyCell => PropertyCell.isPropertyCell(cell))
    .filter(cell => cell.object.owner === currentPlayerId)
    .filter(cell => Business.isBusiness(cell.object) && cell.object.grade === grade);

  if (validProps.length === 0) {
    return [{ type: 'PROPERTY_LOST', propertyIndex: null }];
  }

  const randomIndex = Math.floor(Math.random() * validProps.length);
  return [{ type: 'PROPERTY_LOST', propertyIndex: flatCells.indexOf(validProps[randomIndex]) }];
}
