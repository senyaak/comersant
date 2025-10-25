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
  private readonly color: IRawPlayer['color'];
  private freezeTurns: number = 0;
  private id: IRawPlayer['id'];
  private money: IRawPlayer['money'] = 150_000;
  private readonly name: IRawPlayer['name'];
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
      this.money = entity.money;
    } else {
      throw new Error('Invalid Player constructor argument');
    }
  }

  get Color(): PlayerColor {
    return this.color;
  }

  get Id(): string {
    return this.id;
  }

  set Id(value: string) {
    this.id = value;
  }

  get Money(): number {
    return this.money;
  }

  get Name(): string {
    return this.name;
  }

  get Position(): number {
    return this.position;
  }

  private isArgumentPlayer(entity: unknown): entity is IRawPlayer {
    return typeof entity !== 'string' &&
    'id' in (entity as IRawPlayer) &&
    'color' in (entity as IRawPlayer) &&
    'name' in (entity as IRawPlayer) &&
    'position' in (entity as IRawPlayer);
  }

  changeMoney(amount: number): void {
    this.money += amount;
  }

  move(steps: number): void {
    // Board.cellsCounter;
    if(this.freezeTurns > 0) {
      this.freezeTurns -= 1;
      console.log('player', this.name, 'is frozen for', this.freezeTurns, 'more turns');
      return;
    }
    console.log('move player', this.name, 'by', steps, 'new position:', (this.position + steps) % Board.CellsCounter);
    this.position = (this.position + steps) % Board.CellsCounter;
  }

  skipTurn(): void {
    this.freezeTurns += 1;
  }
}
