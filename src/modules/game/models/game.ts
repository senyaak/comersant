import { randomBytes } from 'crypto';
import { Game } from './type';

export class GameClass implements Game {
  readonly id: string;
  constructor() {
    this.id = randomBytes(16).toString('hex');
  }
}
