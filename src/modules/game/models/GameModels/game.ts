import { randomBytes } from 'crypto';

import { IGame } from './igame';
import { Player, PlayerColor } from './player';

export interface PlayersSettings {
  id: string;
  name: string;
}

export class Game extends IGame {
  public override readonly id: string;
  public override readonly players: Player[];

  constructor(players: { id: string, name: string }[]) {
    super();
    if (players.length < 2) {
      throw new Error('At least two players are required to start a game');
    }

    this.id = randomBytes(16).toString('hex');
    this.players = players.map((player, counter) => {
      return new Player(player.id, Object.values(PlayerColor)[counter], player.name);
    });
  }
}
