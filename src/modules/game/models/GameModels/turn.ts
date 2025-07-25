export enum Turn {
  Trading,
  Moving,
  Event,
}

export function* turnIterator() {
  while (true) {
    yield Turn.Trading;
    yield Turn.Moving;
    yield Turn.Event;
  }
}
