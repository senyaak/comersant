enum PlayerColor {
  red,
  green,
  blue,
  yellow, // add 2 more colors
}
export class Player {
  private money: number;
  private position: number;
  /**
   *  properties: Property[];
   *  items: Item[];
   */

  constructor(
    private color: PlayerColor,
    private name: string,
  ) {
    this.money = 1500;
    this.position = 0;
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
}
