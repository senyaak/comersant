import { Board } from '../FieldModels/board';

export enum PlayerColor {
  red = 'red',
  green = 'green',
  blue = 'blue',
  yellow = 'yellow',
  purple = 'purple',
  orange = 'orange',
}

export interface IRawPlayer {
  id: string;
  color: PlayerColor;
  name: string;
  money: number;
  position: number;
}

export class Player {
  private id: IRawPlayer['id'];
  private readonly color: IRawPlayer['color'];
  private readonly name: IRawPlayer['name'];

  private money: IRawPlayer['money'] = 150_000;
  private position: IRawPlayer['position'] = 0;
  /**
   *  items: Item[];
   */

  constructor(player: IRawPlayer)
  constructor(
    id: string,
    color: PlayerColor,
    name: string,
  )

  constructor(
    entity: string | IRawPlayer,
    color?: PlayerColor,
    name?: string,
  ) {
    if(typeof entity === 'string' && color && name) {
      this.id = entity;
      this.color = color;
      this.name = name;
    } else if(this.isArgumentPlayer(entity)) {
      this.id = entity.id;
      this.color = entity.color;
      this.name = entity.name;
      this.position = entity.position;
    } else {
      throw new Error('Invalid Player constructor argument');
    }
  }

  private isArgumentPlayer(entity: unknown): entity is IRawPlayer {
    return typeof entity !== 'string' &&
    'id' in (entity as IRawPlayer) &&
    'color' in (entity as IRawPlayer) &&
    'name' in (entity as IRawPlayer) &&
    'position' in (entity as IRawPlayer);
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

  get Position(): number {
    return this.position;
  }

  get Id(): string {
    return this.id;
  }

  set Id(value: string) {
    this.id = value;
  }

  move(steps: number): void {
    // Board.cellsCounter;
    console.log('move player', this.name, 'by', steps, 'new position:', (this.position + steps) % Board.cellsCounter);
    this.position = (this.position + steps) % Board.cellsCounter;
  }

  changeMoney(amount: number): void {
    this.money += amount;
  }
}
