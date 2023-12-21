import { Player } from './../player';

export abstract class Property {}

export class Site extends Property {
  owner: Player | null;
}
