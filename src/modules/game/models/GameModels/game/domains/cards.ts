import { EventItem, EventType, GameEvent } from '../../../events';
import { getCardsByType } from '../../../FieldModels/cards';
import {
  CardEventCell,
  CardEventCellTypes,
  Cell,
  EventCell,
  InteractiveEventCell,
  StaticEventCell,
} from '../../../FieldModels/cells';
import {
  UnknownEventCellTypeError,
  UnknownEventItemError,
  UnknownEventTypeError,
  UnknownStaticEventCellTypeError,
} from '../../errors';
import { ItemType } from '../../items';
import { MovementEffect, computeMove, computeMoveToTaxService, computeMoveToCellName } from './movement';
import { PropertyEffect, computeLoseProperty } from './properties';

export type CardEffect =
  | { type: 'CARD_DRAWN'; cardType: CardEventCellTypes; card: GameEvent }
  | { type: 'BALANCE_CHANGED'; playerIndex: number; amount: number }
  | { type: 'TURN_SKIPPED'; playerIndex: number }
  | { type: 'ITEM_RECEIVED'; playerIndex: number; item: ItemType }
  | { type: 'MONEY_TRANSFERRED_FROM_ALL'; centerPlayerIndex: number; playerCount: number; amount: number }
  | { type: 'WAITING_FOR_MOVE_TO_CENTER'; playerIndex: number }
  | { type: 'INTERACTIVE_EVENT'; eventType: EventType }
  | { type: 'STATIC_EVENT'; eventType: EventType; amount?: number }
  | { type: 'MOVE_PLAYER_TODO'; playerIndex: number };

/** Effects that can be produced when processing event cells and cards */
export type CellProcessingEffect = CardEffect | MovementEffect | PropertyEffect;

export function computeCardEvent(
  card: GameEvent,
  cardType: CardEventCellTypes,
  currentPlayerIndex: number,
  currentPlayerId: string,
  playerCount: number,
  flatCells: Cell[],
): CellProcessingEffect[] {
  const effects: CellProcessingEffect[] = [{ type: 'CARD_DRAWN', cardType, card }];

  switch (card.type) {
    case EventType.BalanceChange:
      effects.push({ type: 'BALANCE_CHANGED', playerIndex: currentPlayerIndex, amount: card.amount });
      break;

    case EventType.SkipTurn:
      effects.push({ type: 'TURN_SKIPPED', playerIndex: currentPlayerIndex });
      break;

    case EventType.Move:
      effects.push(...computeMove(currentPlayerIndex, card.amount));
      break;

    case EventType.MovePlayer:
      effects.push({ type: 'MOVE_PLAYER_TODO', playerIndex: currentPlayerIndex });
      break;

    case EventType.MoveTo:
      effects.push(...computeMoveToCellName(currentPlayerIndex, card.to));
      break;

    case EventType.MoveToCenter:
      effects.push({ type: 'WAITING_FOR_MOVE_TO_CENTER', playerIndex: currentPlayerIndex });
      break;

    case EventType.GetEvent:
      switch (card.item) {
        case EventItem.Mail:
          effects.push(...computePrepareCard('post', currentPlayerIndex, currentPlayerId, playerCount, flatCells));
          break;
        case EventItem.Risk:
          effects.push(...computePrepareCard('risk', currentPlayerIndex, currentPlayerId, playerCount, flatCells));
          break;
        case EventItem.Surprise:
          effects.push(...computePrepareCard('surprise', currentPlayerIndex, currentPlayerId, playerCount, flatCells));
          break;
        case EventItem.TaxFree:
          effects.push({ type: 'ITEM_RECEIVED', playerIndex: currentPlayerIndex, item: ItemType.TaxFree });
          break;
        case EventItem.Security:
          effects.push({ type: 'ITEM_RECEIVED', playerIndex: currentPlayerIndex, item: ItemType.Security });
          break;
        default:
          throw new UnknownEventItemError(card.item);
      }
      break;

    case EventType.MoneyTransfer:
      effects.push({
        type: 'MONEY_TRANSFERRED_FROM_ALL',
        centerPlayerIndex: currentPlayerIndex,
        playerCount,
        amount: card.amount,
      });
      break;

    case EventType.PropertyLoss:
      effects.push(...computeLoseProperty(flatCells, currentPlayerId, card.grade));
      break;

    case EventType.TaxService:
      effects.push(...computeMoveToTaxService(currentPlayerIndex, flatCells));
      break;

    default:
      throw new UnknownEventTypeError((card as GameEvent).type);
  }

  return effects;
}

export function computePrepareCard(
  type: CardEventCellTypes,
  currentPlayerIndex: number,
  currentPlayerId: string,
  playerCount: number,
  flatCells: Cell[],
): CellProcessingEffect[] {
  const deck = getCardsByType(type);
  const cardKeys = Object.keys(deck);
  const randomKey = cardKeys[Math.floor(Math.random() * cardKeys.length)];
  const card = deck[randomKey];
  return computeCardEvent(card, type, currentPlayerIndex, currentPlayerId, playerCount, flatCells);
}

export function computeEventCell(
  cell: EventCell,
  currentPlayerIndex: number,
  currentPlayerId: string,
  playerCount: number,
  flatCells: Cell[],
): CellProcessingEffect[] {
  if (cell instanceof CardEventCell) {
    return computePrepareCard(cell.type, currentPlayerIndex, currentPlayerId, playerCount, flatCells);
  }
  if (cell instanceof StaticEventCell) {
    return computeStaticEventCell(cell, currentPlayerIndex, flatCells);
  }
  if (cell instanceof InteractiveEventCell) {
    return [{ type: 'INTERACTIVE_EVENT', eventType: cell.type }];
  }
  throw new UnknownEventCellTypeError();
}

function computeStaticEventCell(
  cell: StaticEventCell,
  currentPlayerIndex: number,
  flatCells: Cell[],
): CellProcessingEffect[] {
  const effects: CellProcessingEffect[] = [];
  switch (cell.type) {
    case EventType.TaxService:
      effects.push({ type: 'STATIC_EVENT', eventType: EventType.TaxService });
      effects.push(...computeMoveToTaxService(currentPlayerIndex, flatCells));
      break;
    case EventType.BalanceChange:
      effects.push({ type: 'STATIC_EVENT', eventType: EventType.BalanceChange, amount: cell.amount });
      effects.push({ type: 'BALANCE_CHANGED', playerIndex: currentPlayerIndex, amount: cell.amount ?? 0 });
      break;
    case EventType.SkipTurn:
      effects.push({ type: 'STATIC_EVENT', eventType: EventType.SkipTurn });
      effects.push({ type: 'TURN_SKIPPED', playerIndex: currentPlayerIndex });
      break;
    default:
      throw new UnknownStaticEventCellTypeError(cell.type);
  }
  return effects;
}
