export enum Trun {
  Trading,
  Moving,
  Event,
}

export function* turnIterator() {
  while (true) {
    yield Trun.Trading;
    yield Trun.Moving;
    yield Trun.Event;
  }
}
