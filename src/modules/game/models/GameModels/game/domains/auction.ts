import {
  AuctionNotStartedError,
  NotInAuctionError,
  PlayerAlreadyPassedError,
} from '../../errors';
import { TradingEvent } from '../../gamePlayerEvent';

export type AuctionEffect =
  | { type: 'AUCTION_OPENED_TO_ALL'; propertyIndex: number; price: number; playerIndices: number[] }
  | { type: 'AUCTION_PLAYER_PASSED'; playerIndex: number }
  | { type: 'AUCTION_FAILED'; propertyIndex: number }
  | { type: 'AUCTION_BID_PLACED'; playerIndex: number; price: number }
  | { type: 'AUCTION_BID_INVALID'; playerIndex: number; reason: string };

export function computeAuctionPass(
  eventData: TradingEvent['eventData'],
  playerIndex: number,
  allPlayerCount: number,
): AuctionEffect[] {
  // First buy offer refusal — start full auction
  if (eventData.playerIndices.length === 1 && eventData.playerIndices[0] === playerIndex) {
    const allPlayerIndices = Array.from({ length: allPlayerCount }, (_, i) => i);
    return [{
      type: 'AUCTION_OPENED_TO_ALL',
      propertyIndex: eventData.propertyIndex,
      price: eventData.price,
      playerIndices: allPlayerIndices,
    }];
  }

  if (!eventData.playerIndices.includes(playerIndex)) {
    throw new NotInAuctionError(playerIndex);
  }
  if (eventData.passedPlayerIndices.includes(playerIndex)) {
    throw new PlayerAlreadyPassedError(playerIndex);
  }

  const newPassed = [...eventData.passedPlayerIndices, playerIndex];
  const activePlayers = eventData.playerIndices.filter(idx => !newPassed.includes(idx));

  if (activePlayers.length === 0) {
    return [
      { type: 'AUCTION_PLAYER_PASSED', playerIndex },
      { type: 'AUCTION_FAILED', propertyIndex: eventData.propertyIndex },
    ];
  }

  return [{ type: 'AUCTION_PLAYER_PASSED', playerIndex }];
}

export function computeAuctionBid(
  eventData: TradingEvent['eventData'],
  playerIndex: number,
  bidAmount: number,
  playerMoney: number,
): AuctionEffect[] {
  if (eventData.playerIndices.length === 1) {
    throw new AuctionNotStartedError();
  }
  if (eventData.passedPlayerIndices.includes(playerIndex)) {
    throw new PlayerAlreadyPassedError(playerIndex);
  }
  if (!eventData.playerIndices.includes(playerIndex)) {
    throw new NotInAuctionError(playerIndex);
  }
  if (bidAmount <= eventData.price) {
    return [
      { type: 'AUCTION_BID_INVALID', playerIndex, reason: `Bid must be higher than current price ${eventData.price}` },
    ];
  }
  if (playerMoney < bidAmount) {
    return [{ type: 'AUCTION_BID_INVALID', playerIndex, reason: 'Insufficient funds' }];
  }
  return [{ type: 'AUCTION_BID_PLACED', playerIndex, price: bidAmount }];
}
