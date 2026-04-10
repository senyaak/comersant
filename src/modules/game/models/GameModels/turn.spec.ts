import { Turn, turnIterator } from './turn';

describe('turnIterator', () => {
  it('first yield returns Turn.Trading', () => {
    const it = turnIterator();
    expect(it.next().value).toBe(Turn.Trading);
  });

  it('subsequent yields alternate Trading → Event → Trading → Event', () => {
    const it = turnIterator();
    expect(it.next().value).toBe(Turn.Trading);
    expect(it.next().value).toBe(Turn.Event);
    expect(it.next().value).toBe(Turn.Trading);
    expect(it.next().value).toBe(Turn.Event);
  });

  it('iterator is infinite (never returns done=true)', () => {
    const it = turnIterator();
    for (let i = 0; i < 100; i++) {
      expect(it.next().done).toBe(false);
    }
  });
});
