import { EventItem, EventType, GameEvent } from '../../../events';
import { Board } from '../../../FieldModels/board';
import { Post, Risk, Surprise } from '../../../FieldModels/cards';
import {
  Cell,
  CardEventCell,
  InteractiveEventCell,
  PropertyCell,
  StartCell,
  StaticEventCell,
  TaxServiceCell,
} from '../../../FieldModels/cells';
import { ItemType } from '../../items';
import { Business, BusinessGrade } from '../../properties';
import {
  computeCardEvent,
  computeEventCell,
  computePrepareCard,
} from './cards';

const flatCells = () => new Board().flatCells;

// Hand-built flat cell array: TaxServiceCell sits at index 2, nothing else matters.
const fakeFlatCells = (): Cell[] => [
  new StartCell(),
  new StartCell(),
  new TaxServiceCell(),
  new StartCell(),
];

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

  it('MoveTo → CARD_DRAWN + PLAYER_MOVED_TO_POSITION targeting the hard-coded Start cell index', () => {
    // Start is the first cell of the real board at index 0 — hard-coded on purpose so
    // this test does not recompute the expected value through the same code path the
    // implementation uses (Board.getTargetPosition).
    const card: GameEvent = { msg: 'x', type: EventType.MoveTo, to: 'Start' };

    expect(computeCardEvent(card, 'post', 0, 'p1', 3, flatCells())).toEqual([
      { type: 'CARD_DRAWN', cardType: 'post', card },
      { type: 'PLAYER_MOVED_TO_POSITION', playerIndex: 0, targetPosition: 0 },
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

  it('TaxService → CARD_DRAWN + PLAYER_MOVED_TO_POSITION pointing at the TaxServiceCell', () => {
    // Use a fake cells array where the TaxServiceCell sits at a known index (2).
    // This way the expected targetPosition is an explicit constant, not rediscovered
    // by the same findIndex the implementation uses.
    const card: GameEvent = { msg: 'x', type: EventType.TaxService };

    expect(computeCardEvent(card, 'post', 0, 'p1', 3, fakeFlatCells())).toEqual([
      { type: 'CARD_DRAWN', cardType: 'post', card },
      { type: 'PLAYER_MOVED_TO_POSITION', playerIndex: 0, targetPosition: 2 },
    ]);
  });
});

describe('computeCardEvent — GetEvent variants', () => {
  const nestedDraw = (effects: ReturnType<typeof computeCardEvent>) =>
    effects.filter(e => e.type === 'CARD_DRAWN')[1];

  it('EventItem.Mail draws a Post-deck card after the GetEvent trigger', () => {
    const card: GameEvent = { msg: 'x', type: EventType.GetEvent, item: EventItem.Mail };
    const effects = computeCardEvent(card, 'post', 0, 'p1', 3, flatCells());

    expect(effects[0]).toEqual({ type: 'CARD_DRAWN', cardType: 'post', card });
    const nested = nestedDraw(effects);
    expect(nested).toBeDefined();
    if (nested?.type === 'CARD_DRAWN') {
      expect(nested.cardType).toBe('post');
      expect(Object.values(Post)).toContain(nested.card);
    }
  });

  it('EventItem.Risk draws a Risk-deck card after the GetEvent trigger', () => {
    const card: GameEvent = { msg: 'x', type: EventType.GetEvent, item: EventItem.Risk };
    const effects = computeCardEvent(card, 'risk', 0, 'p1', 3, flatCells());

    const nested = nestedDraw(effects);
    expect(nested).toBeDefined();
    if (nested?.type === 'CARD_DRAWN') {
      expect(nested.cardType).toBe('risk');
      expect(Object.values(Risk)).toContain(nested.card);
    }
  });

  it('EventItem.Surprise draws a Surprise-deck card after the GetEvent trigger', () => {
    const card: GameEvent = { msg: 'x', type: EventType.GetEvent, item: EventItem.Surprise };
    const effects = computeCardEvent(card, 'surprise', 0, 'p1', 3, flatCells());

    const nested = nestedDraw(effects);
    expect(nested).toBeDefined();
    if (nested?.type === 'CARD_DRAWN') {
      expect(nested.cardType).toBe('surprise');
      expect(Object.values(Surprise)).toContain(nested.card);
    }
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
  it('draws a card that belongs to the Post deck when "post" is requested', () => {
    const effects = computePrepareCard('post', 0, 'p1', 3, flatCells());
    const drawn = effects[0];
    expect(drawn.type).toBe('CARD_DRAWN');
    if (drawn.type === 'CARD_DRAWN') {
      expect(drawn.cardType).toBe('post');
      expect(Object.values(Post)).toContain(drawn.card);
    }
  });

  it('draws a card that belongs to the Risk deck when "risk" is requested', () => {
    const effects = computePrepareCard('risk', 0, 'p1', 3, flatCells());
    const drawn = effects[0];
    if (drawn.type === 'CARD_DRAWN') {
      expect(drawn.cardType).toBe('risk');
      expect(Object.values(Risk)).toContain(drawn.card);
    }
  });

  it('draws a card that belongs to the Surprise deck when "surprise" is requested', () => {
    const effects = computePrepareCard('surprise', 0, 'p1', 3, flatCells());
    const drawn = effects[0];
    if (drawn.type === 'CARD_DRAWN') {
      expect(drawn.cardType).toBe('surprise');
      expect(Object.values(Surprise)).toContain(drawn.card);
    }
  });
});

describe('computeEventCell', () => {
  it('delegates to computePrepareCard for a CardEventCell, preserving the cell type', () => {
    const cell = new CardEventCell('surprise');
    const effects = computeEventCell(cell, 0, 'p1', 3, flatCells());
    const drawn = effects[0];
    expect(drawn.type).toBe('CARD_DRAWN');
    if (drawn.type === 'CARD_DRAWN') {
      expect(drawn.cardType).toBe('surprise');
      expect(Object.values(Surprise)).toContain(drawn.card);
    }
  });

  it('returns INTERACTIVE_EVENT for an InteractiveEventCell', () => {
    const cell = new InteractiveEventCell(EventType.MoveToCenter);
    expect(computeEventCell(cell, 0, 'p1', 3, flatCells())).toEqual([
      { type: 'INTERACTIVE_EVENT', eventType: EventType.MoveToCenter },
    ]);
  });

  it('StaticEventCell TaxService → STATIC_EVENT + PLAYER_MOVED_TO_POSITION at the known index', () => {
    const cell = new StaticEventCell(EventType.TaxService);

    expect(computeEventCell(cell, 0, 'p1', 3, fakeFlatCells())).toEqual([
      { type: 'STATIC_EVENT', eventType: EventType.TaxService },
      { type: 'PLAYER_MOVED_TO_POSITION', playerIndex: 0, targetPosition: 2 },
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

