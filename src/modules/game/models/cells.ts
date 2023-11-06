import { Player } from './player';

export abstract class Cell {
  event: (player: Player) => Promise<void>;
}

export class CellStart extends Cell {}

export class Property extends Cell {
  owner: Player | null;
  object: any;
}
