import { EventItem, EventType, GameEvent } from '../../../events';
import { Board } from '../../../FieldModels/board';
import {
  CardEventCell,
  InteractiveEventCell,
  PropertyCell,
  StaticEventCell,
} from '../../../FieldModels/cells';
import { ItemType } from '../../items';
import { Business, BusinessGrade } from '../../properties';
import {
  computeCardEvent,
  computeEventCell,
  computePrepareCard,
} from './cards';

const flatCells = () => new Board().flatCells;

describe('computeCardEvent — per EventType branch', () => {
  it('BalanceChange → CARD_DRAWN + BALANCE_CHANGED with the card amount', () => {
    const card: GameEvent = { msg: 'x', type: EventType.BalanceChange, amount: 500 };
    expect(computeCardEvent(card, 'post', 0, 'p1', 3, flatCells())).toEqual([
      { type: 'CARD_DRAWN', cardType: 'post', card },
      { type: 'BALANCE_CHANGED', playerIndex: 0, amount: 500 },
    ]);
  });

  it('SkipTurn → CARD_DRAWN + TURN_SKIPPED for the current player', () => {
    const card: GameEvent = { msg: 'x', type: EventType.SkipTurn };
    expect(computeCardEvent(card, 'risk', 1, 'p2', 3, flatCells())).toEqual([
      { type: 'CARD_DRAWN', cardType: 'risk', card },
      { type: 'TURN_SKIPPED', playerIndex: 1 },
    ]);
  });

  it('Move → CARD_DRAWN + PLAYER_MOVED with the card amount as steps', () => {
    const card: GameEvent = { msg: 'x', type: EventType.Move, amount: 4 };
    expect(computeCardEvent(card, 'surprise', 2, 'p3', 3, flatCells())).toEqual([
      { type: 'CARD_DRAWN', cardType: 'surprise', card },
      { type: 'PLAYER_MOVED', playerIndex: 2, steps: 4 },
    ]);
  });

  it('MovePlayer → CARD_DRAWN + MOVE_PLAYER_TODO placeholder (feature stub)', () => {
    const card: GameEvent = { msg: 'x', type: EventType.MovePlayer };
    expect(computeCardEvent(card, 'risk', 0, 'p1', 3, flatCells())).toEqual([
      { type: 'CARD_DRAWN', cardType: 'risk', card },
      { type: 'MOVE_PLAYER_TODO', playerIndex: 0 },
    ]);
  });

  it('MoveTo → CARD_DRAWN + PLAYER_MOVED_TO_POSITION resolved by Board.getTargetPosition', () => {
    const cells = flatCells();
    const namedCell = cells.find(c => c.name === 'TaxService') ?? cells[0];
    const card: GameEvent = { msg: 'x', type: EventType.MoveTo, to: namedCell.name };

    expect(computeCardEvent(card, 'post', 0, 'p1', 3, cells)).toEqual([
      { type: 'CARD_DRAWN', cardType: 'post', card },
      {
        type: 'PLAYER_MOVED_TO_POSITION',
        playerIndex: 0,
        targetPosition: Board.getTargetPosition(namedCell.name),
      },
    ]);
  });

  it('MoveToCenter → CARD_DRAWN + WAITING_FOR_MOVE_TO_CENTER', () => {
    const card: GameEvent = { msg: 'x', type: EventType.MoveToCenter };
    expect(computeCardEvent(card, 'post', 1, 'p2', 3, flatCells())).toEqual([
      { type: 'CARD_DRAWN', cardType: 'post', card },
      { type: 'WAITING_FOR_MOVE_TO_CENTER', playerIndex: 1 },
    ]);
  });

  it('MoneyTransfer → CARD_DRAWN + MONEY_TRANSFERRED_FROM_ALL with playerCount and amount', () => {
    const card: GameEvent = { msg: 'x', type: EventType.MoneyTransfer, amount: 200 };
    expect(computeCardEvent(card, 'risk', 0, 'p1', 4, flatCells())).toEqual([
      { type: 'CARD_DRAWN', cardType: 'risk', card },
      { type: 'MONEY_TRANSFERRED_FROM_ALL', centerPlayerIndex: 0, playerCount: 4, amount: 200 },
    ]);
  });

  it('PropertyLoss → CARD_DRAWN + PROPERTY_LOST delegated to computeLoseProperty', () => {
    const cells = flatCells();
    // No matching properties owned → PROPERTY_LOST with null index
    const card: GameEvent = { msg: 'x', type: EventType.PropertyLoss, grade: BusinessGrade.Office };
    expect(computeCardEvent(card, 'risk', 0, 'p1', 3, cells)).toEqual([
      { type: 'CARD_DRAWN', cardType: 'risk', card },
      { type: 'PROPERTY_LOST', propertyIndex: null },
    ]);
  });

  it('PropertyLoss → CARD_DRAWN + PROPERTY_LOST with a concrete index when the player owns a matching business', () => {
    const cells = flatCells();
    const idx = cells.findIndex(c =>
      PropertyCell.isPropertyCell(c) && Business.isBusiness(c.object),
    );
    const cell = cells[idx] as PropertyCell<Business>;
    cell.object.owner = 'p1';
    cell.object.grade = BusinessGrade.Enterprise;

    const card: GameEvent = { msg: 'x', type: EventType.PropertyLoss, grade: BusinessGrade.Enterprise };
    const effects = computeCardEvent(card, 'risk', 0, 'p1', 3, cells);

    expect(effects[0]).toEqual({ type: 'CARD_DRAWN', cardType: 'risk', card });
    expect(effects[1]).toEqual({ type: 'PROPERTY_LOST', propertyIndex: idx });
  });

  it('TaxService → CARD_DRAWN + PLAYER_MOVED_TO_POSITION pointing at the tax service cell', () => {
    const cells = flatCells();
    const taxIdx = cells.findIndex(c => c.name === 'TaxService');
    const card: GameEvent = { msg: 'x', type: EventType.TaxService };

    expect(computeCardEvent(card, 'post', 0, 'p1', 3, cells)).toEqual([
      { type: 'CARD_DRAWN', cardType: 'post', card },
      { type: 'PLAYER_MOVED_TO_POSITION', playerIndex: 0, targetPosition: taxIdx },
    ]);
  });
});

describe('computeCardEvent — GetEvent variants', () => {
  it('EventItem.Mail recurses through computePrepareCard("post")', () => {
    const card: GameEvent = { msg: 'x', type: EventType.GetEvent, item: EventItem.Mail };
    const effects = computeCardEvent(card, 'post', 0, 'p1', 3, flatCells());

    // Outer CARD_DRAWN for the trigger card, plus a nested CARD_DRAWN for the mail draw
    expect(effects[0]).toEqual({ type: 'CARD_DRAWN', cardType: 'post', card });
    expect(effects.some(e => e.type === 'CARD_DRAWN' && e !== effects[0])).toBe(true);
  });

  it('EventItem.Risk recurses through computePrepareCard("risk")', () => {
    const card: GameEvent = { msg: 'x', type: EventType.GetEvent, item: EventItem.Risk };
    const effects = computeCardEvent(card, 'risk', 0, 'p1', 3, flatCells());
    expect(effects.filter(e => e.type === 'CARD_DRAWN').length).toBeGreaterThanOrEqual(2);
  });

  it('EventItem.Surprise recurses through computePrepareCard("surprise")', () => {
    const card: GameEvent = { msg: 'x', type: EventType.GetEvent, item: EventItem.Surprise };
    const effects = computeCardEvent(card, 'surprise', 0, 'p1', 3, flatCells());
    expect(effects.filter(e => e.type === 'CARD_DRAWN').length).toBeGreaterThanOrEqual(2);
  });

  it('EventItem.TaxFree → ITEM_RECEIVED with ItemType.TaxFree', () => {
    const card: GameEvent = { msg: 'x', type: EventType.GetEvent, item: EventItem.TaxFree };
    expect(computeCardEvent(card, 'post', 1, 'p2', 3, flatCells())).toContainEqual({
      type: 'ITEM_RECEIVED',
      playerIndex: 1,
      item: ItemType.TaxFree,
    });
  });

  it('EventItem.Security → ITEM_RECEIVED with ItemType.Security', () => {
    const card: GameEvent = { msg: 'x', type: EventType.GetEvent, item: EventItem.Security };
    expect(computeCardEvent(card, 'post', 0, 'p1', 3, flatCells())).toContainEqual({
      type: 'ITEM_RECEIVED',
      playerIndex: 0,
      item: ItemType.Security,
    });
  });

  it('throws on an unknown EventItem', () => {
    const card = { msg: 'x', type: EventType.GetEvent, item: 999 } as unknown as GameEvent;
    expect(() => computeCardEvent(card, 'post', 0, 'p1', 3, flatCells())).toThrow('Unknown event item');
  });
});

describe('computeCardEvent — error paths', () => {
  it('throws on an unknown EventType', () => {
    const card = { msg: 'x', type: 9999 } as unknown as GameEvent;
    expect(() => computeCardEvent(card, 'post', 0, 'p1', 3, flatCells())).toThrow('Unknown event type');
  });

  it('throws on EventType.Raccito — the enum value is declared but not handled in the switch', () => {
    // Regression guard: if Raccito support is implemented later, this test should be updated
    // to assert the new behavior rather than removed silently.
    const card = { msg: 'x', type: EventType.Raccito } as unknown as GameEvent;
    expect(() => computeCardEvent(card, 'post', 0, 'p1', 3, flatCells())).toThrow('Unknown event type');
  });
});

describe('computePrepareCard', () => {
  it('picks a card from the deck of the requested type', () => {
    const effects = computePrepareCard('post', 0, 'p1', 3, flatCells());
    expect(effects[0].type).toBe('CARD_DRAWN');
  });

  it('forwards to computeCardEvent so the same effect rules apply', () => {
    const effects = computePrepareCard('risk', 0, 'p1', 3, flatCells());
    expect(effects.length).toBeGreaterThanOrEqual(2);
  });
});

describe('computeEventCell', () => {
  it('delegates to computePrepareCard for a CardEventCell', () => {
    const cell = new CardEventCell('post');
    const effects = computeEventCell(cell, 0, 'p1', 3, flatCells());
    expect(effects[0].type).toBe('CARD_DRAWN');
  });

  it('returns INTERACTIVE_EVENT for an InteractiveEventCell', () => {
    const cell = new InteractiveEventCell(EventType.MoveToCenter);
    expect(computeEventCell(cell, 0, 'p1', 3, flatCells())).toEqual([
      { type: 'INTERACTIVE_EVENT', eventType: EventType.MoveToCenter },
    ]);
  });

  it('StaticEventCell TaxService → STATIC_EVENT + PLAYER_MOVED_TO_POSITION (tax service)', () => {
    const cells = flatCells();
    const cell = new StaticEventCell(EventType.TaxService);
    const taxIdx = cells.findIndex(c => c.name === 'TaxService');

    expect(computeEventCell(cell, 0, 'p1', 3, cells)).toEqual([
      { type: 'STATIC_EVENT', eventType: EventType.TaxService },
      { type: 'PLAYER_MOVED_TO_POSITION', playerIndex: 0, targetPosition: taxIdx },
    ]);
  });

  it('StaticEventCell BalanceChange → STATIC_EVENT(amount) + BALANCE_CHANGED(amount ?? 0)', () => {
    const cell = new StaticEventCell(EventType.BalanceChange, 300);
    expect(computeEventCell(cell, 1, 'p2', 3, flatCells())).toEqual([
      { type: 'STATIC_EVENT', eventType: EventType.BalanceChange, amount: 300 },
      { type: 'BALANCE_CHANGED', playerIndex: 1, amount: 300 },
    ]);
  });

  it('StaticEventCell BalanceChange without an amount defaults BALANCE_CHANGED to 0', () => {
    // The no-arg StaticEventCell overload leaves amount undefined — the ?? 0 fallback kicks in.
    const cell = new StaticEventCell(EventType.BalanceChange);
    expect(computeEventCell(cell, 0, 'p1', 3, flatCells())).toEqual([
      { type: 'STATIC_EVENT', eventType: EventType.BalanceChange, amount: undefined },
      { type: 'BALANCE_CHANGED', playerIndex: 0, amount: 0 },
    ]);
  });

  it('StaticEventCell SkipTurn → STATIC_EVENT + TURN_SKIPPED', () => {
    const cell = new StaticEventCell(EventType.SkipTurn);
    expect(computeEventCell(cell, 2, 'p3', 3, flatCells())).toEqual([
      { type: 'STATIC_EVENT', eventType: EventType.SkipTurn },
      { type: 'TURN_SKIPPED', playerIndex: 2 },
    ]);
  });

  it('throws on an unknown StaticEventCell type', () => {
    const cell = new StaticEventCell(EventType.Move);
    expect(() => computeEventCell(cell, 0, 'p1', 3, flatCells())).toThrow('Unknown static event cell type');
  });

  it('throws on a cell that is none of the known EventCell subclasses', () => {
    const property = flatCells().find(PropertyCell.isPropertyCell)!;
    expect(() => computeEventCell(property as never, 0, 'p1', 3, flatCells())).toThrow('Unknown event cell type');
  });
});

// Suppress unused-import warning helper for Business if added later
void Business;
