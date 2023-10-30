import { randomBytes } from 'crypto';

export class Game {
  readonly id: string;
  constructor() {
    this.id = randomBytes(16).toString('hex');
  }
}
