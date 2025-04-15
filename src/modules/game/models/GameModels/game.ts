import { randomBytes } from 'crypto';

import { IGame } from '../type';
import { Player } from './player';

export class Game implements IGame {
  readonly id: string;
  readonly players: Player[];
  constructor(players: string[]) {
    this.id = randomBytes(16).toString('hex');
    this.players = players.map((playerName, counter) => {
      return new Player(counter, playerName);
    });
  }
}

// const a = { test: 1 } satisfies Record<string, number>;
// console.log(a.test);
