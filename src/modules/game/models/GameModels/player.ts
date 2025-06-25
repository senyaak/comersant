export enum PlayerColor {
  red = 'red',
  green = 'green',
  blue = 'blue',
  yellow = 'yellow', // add 2 more colors
}
export class Player {
  private money: number = 150_000;
  private position: number = 0;
  /**
   *  properties: Property[];
   *  items: Item[];
   */

  constructor(
    private readonly id: string,
    private color: PlayerColor,
    private name: string,
  ) {
  }

  get Color(): PlayerColor {
    return this.color;
  }

  get Name(): string {
    return this.name;
  }

  get Money(): number {
    return this.money;
  }

  get Id(): string {
    return this.id;
  }
}
