describe('computeCardEvent — per EventType branch', () => {
  it.todo('BalanceChange → CARD_DRAWN + BALANCE_CHANGED with the card amount');
  it.todo('SkipTurn → CARD_DRAWN + TURN_SKIPPED for the current player');
  it.todo('Move → CARD_DRAWN + PLAYER_MOVED with the card amount as steps');
  it.todo('MovePlayer → CARD_DRAWN + MOVE_PLAYER_TODO placeholder (feature stub)');
  it.todo('MoveTo → CARD_DRAWN + PLAYER_MOVED_TO_POSITION resolved by Board.getTargetPosition');
  it.todo('MoveToCenter → CARD_DRAWN + WAITING_FOR_MOVE_TO_CENTER');
  it.todo('MoneyTransfer → CARD_DRAWN + MONEY_TRANSFERRED_FROM_ALL with playerCount and amount');
  it.todo('PropertyLoss → CARD_DRAWN + PROPERTY_LOST delegated to computeLoseProperty');
  it.todo('TaxService → CARD_DRAWN + PLAYER_MOVED_TO_POSITION pointing at the tax service cell');
});

describe('computeCardEvent — GetEvent variants', () => {
  it.todo('EventItem.Mail recurses through computePrepareCard("post")');
  it.todo('EventItem.Risk recurses through computePrepareCard("risk")');
  it.todo('EventItem.Surprise recurses through computePrepareCard("surprise")');
  it.todo('EventItem.TaxFree → ITEM_RECEIVED with ItemType.TaxFree');
  it.todo('EventItem.Security → ITEM_RECEIVED with ItemType.Security');
  it.todo('throws on an unknown EventItem');
});

describe('computeCardEvent — error paths', () => {
  it.todo('throws on an unknown EventType');
});

describe('computePrepareCard', () => {
  it.todo('picks a card from the deck of the requested type');
  it.todo('forwards to computeCardEvent so the same effect rules apply');
});

describe('computeEventCell', () => {
  it.todo('delegates to computePrepareCard for a CardEventCell');
  it.todo('returns INTERACTIVE_EVENT for an InteractiveEventCell');
  it.todo('StaticEventCell TaxService → STATIC_EVENT + PLAYER_MOVED_TO_POSITION (tax service)');
  it.todo('StaticEventCell BalanceChange → STATIC_EVENT(amount) + BALANCE_CHANGED(amount ?? 0)');
  it.todo('StaticEventCell SkipTurn → STATIC_EVENT + TURN_SKIPPED');
  it.todo('throws on an unknown StaticEventCell type');
  it.todo('throws on a cell that is none of the known EventCell subclasses');
});
