import { TradingEvent } from '../../gamePlayerEvent';
import { computeAuctionBid, computeAuctionPass } from './auction';

const baseEventData = (overrides: Partial<TradingEvent['eventData']> = {}): TradingEvent['eventData'] => ({
  playerIndices: [0, 1, 2],
  price: 100,
  propertyIndex: 5,
  currentBidderIndex: null,
  passedPlayerIndices: [],
  ...overrides,
});

describe('computeAuctionPass', () => {
  it('opens the auction to all players when the offered player refuses the first buy (single playerIndices entry)', () => {
    const data = baseEventData({ playerIndices: [0] });
    expect(computeAuctionPass(data, 0, 3)).toEqual([
      { type: 'AUCTION_OPENED_TO_ALL', propertyIndex: 5, price: 100, playerIndices: [0, 1, 2] },
    ]);
  });

  it('appends the passing player to passedPlayerIndices on a regular pass', () => {
    const data = baseEventData();
    expect(computeAuctionPass(data, 1, 3)).toEqual([
      { type: 'AUCTION_PLAYER_PASSED', playerIndex: 1 },
    ]);
  });

  it('returns AUCTION_PLAYER_PASSED + AUCTION_FAILED when the last active bidder passes', () => {
    const data = baseEventData({ passedPlayerIndices: [0, 1] });
    expect(computeAuctionPass(data, 2, 3)).toEqual([
      { type: 'AUCTION_PLAYER_PASSED', playerIndex: 2 },
      { type: 'AUCTION_FAILED', propertyIndex: 5 },
    ]);
  });

  it('throws when the player is not part of eventData.playerIndices', () => {
    const data = baseEventData({ playerIndices: [0, 1] });
    expect(() => computeAuctionPass(data, 2, 3)).toThrow('cannot participate');
  });

  it('throws when the player has already passed in this auction', () => {
    const data = baseEventData({ passedPlayerIndices: [1] });
    expect(() => computeAuctionPass(data, 1, 3)).toThrow('already passed');
  });

  it('does NOT trigger first-buy refusal when the sole invited player is different from the passer', () => {
    // playerIndices = [1] means player 1 was offered the property, but player 0 is trying to pass
    const data = baseEventData({ playerIndices: [1] });
    expect(() => computeAuctionPass(data, 0, 3)).toThrow('cannot participate');
  });
});

describe('computeAuctionBid', () => {
  it('throws when called before the auction is opened to all (still single playerIndices)', () => {
    const data = baseEventData({ playerIndices: [0] });
    expect(() => computeAuctionBid(data, 0, 200, 1000)).toThrow('Auction not started');
  });

  it('throws when the bidder has already passed', () => {
    const data = baseEventData({ passedPlayerIndices: [1] });
    expect(() => computeAuctionBid(data, 1, 200, 1000)).toThrow('already passed');
  });

  it('throws when the bidder is not in eventData.playerIndices', () => {
    const data = baseEventData({ playerIndices: [0, 1] });
    expect(() => computeAuctionBid(data, 2, 200, 1000)).toThrow('cannot participate');
  });

  it('returns AUCTION_BID_INVALID with a price reason when bid is not strictly above current price', () => {
    const data = baseEventData();
    expect(computeAuctionBid(data, 1, 100, 1000)).toEqual([
      { type: 'AUCTION_BID_INVALID', playerIndex: 1, reason: expect.stringContaining('higher than current price 100') },
    ]);
  });

  it('returns AUCTION_BID_INVALID with an insufficient funds reason when player money < bid', () => {
    const data = baseEventData();
    expect(computeAuctionBid(data, 1, 200, 50)).toEqual([
      { type: 'AUCTION_BID_INVALID', playerIndex: 1, reason: 'Insufficient funds' },
    ]);
  });

  it('returns AUCTION_BID_PLACED with the new price when the bid is valid', () => {
    const data = baseEventData();
    expect(computeAuctionBid(data, 1, 250, 1000)).toEqual([
      { type: 'AUCTION_BID_PLACED', playerIndex: 1, price: 250 },
    ]);
  });

  it('allows a bid exactly equal to the bidder\'s money (boundary)', () => {
    const data = baseEventData({ price: 100 });
    expect(computeAuctionBid(data, 1, 250, 250)).toEqual([
      { type: 'AUCTION_BID_PLACED', playerIndex: 1, price: 250 },
    ]);
  });

  it('allows the current bidder to raise their own bid (self-rebid is not restricted)', () => {
    const data = baseEventData({ price: 100, currentBidderIndex: 1 });
    expect(computeAuctionBid(data, 1, 150, 1000)).toEqual([
      { type: 'AUCTION_BID_PLACED', playerIndex: 1, price: 150 },
    ]);
  });
});
