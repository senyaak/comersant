import { randomBytes } from 'crypto';

import { IGame } from '../type';
import { Player, PlayerColor } from './player';

export interface PlayersSettings {
  id: string;
  name: string;
}

export class Game implements IGame {
  readonly id: string;
  readonly players: Player[];
  constructor(players: { id: string, name: string }[]) {
    this.id = randomBytes(16).toString('hex');
    this.players = players.map((player, counter) => {
      return new Player(player.id, Object.values(PlayerColor)[counter], player.name);
    });
  }
}

// const a = { test: 1 } satisfies Record<string, number>;
// console.log(a.test);
