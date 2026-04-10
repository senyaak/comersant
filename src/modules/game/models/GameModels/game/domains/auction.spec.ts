describe('computeAuctionPass', () => {
  it.todo('opens the auction to all players when the offered player refuses the first buy (single playerIndices entry)');
  it.todo('appends the passing player to passedPlayerIndices on a regular pass');
  it.todo('returns AUCTION_PLAYER_PASSED + AUCTION_FAILED when the last active bidder passes');
  it.todo('throws when the player is not part of eventData.playerIndices');
  it.todo('throws when the player has already passed in this auction');
});

describe('computeAuctionBid', () => {
  it.todo('throws when called before the auction is opened to all (still single playerIndices)');
  it.todo('throws when the bidder has already passed');
  it.todo('throws when the bidder is not in eventData.playerIndices');
  it.todo('returns AUCTION_BID_INVALID with a price reason when bid is not strictly above current price');
  it.todo('returns AUCTION_BID_INVALID with an insufficient funds reason when player money < bid');
  it.todo('returns AUCTION_BID_PLACED with the new price when the bid is valid');
});
