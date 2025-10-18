export enum Turn {
  Trading = 'Trading',
  Event = 'Event',
}

export function* turnIterator() {
  while (true) {
    yield Turn.Trading;
    yield Turn.Event;
  }
}
