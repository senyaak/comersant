import { Board } from '../FieldModels/board';
import { Cell } from '../FieldModels/cells';
import { ItemType } from './items';

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
  raccito: boolean;
  raccitoCounter: number;
}

export class Player {
  private readonly color: IRawPlayer['color'];
  private freezeTurns: number = 0;
  private id: IRawPlayer['id'];
  private items: ItemType[] = [];
  private money: IRawPlayer['money'] = 150_000;
  private readonly name: IRawPlayer['name'];
  private position: IRawPlayer['position'] = 0;
  private raccito: boolean = false;
  private raccitoCounter: number = 0;
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

  get Raccito(): boolean {
    return this.raccito;
  }

  get RaccitoCounter(): number {
    return this.raccitoCounter;
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

  giveItem(item: ItemType): void {
    this.items.push(item);
  }

  move(steps: number): void {
    // Board.cellsCounter;
    if(this.freezeTurns > 0) {
      // TODO: handle in event service? since we have to send event to FE...
      // this.freezeTurns -= 1;
      // console.log('player', this.name, 'is frozen for', this.freezeTurns, 'more turns');
      throw new Error('Player is frozen and cannot move');
    }
    if(this.raccitoCounter > 0) {
      this.raccitoCounter -= steps;
    }

    console.log('move player', this.name, 'by', steps, 'new position:', (this.position + steps) % Board.CellsCounter);
    this.position = (this.position + steps) % Board.CellsCounter;
  }

  moveTo(cellName: Cell['name']): void {
    const newPostition = Board.getTargetPosition(cellName);
    const steps = Math.abs(newPostition - this.Position);
    this.move(steps);
  }

  removeRaccito(): void {
    if(this.raccitoCounter > 0) {
      throw new Error('Cannot remove raccito while counter is active');
    }
    this.raccito = false;
    this.raccitoCounter = 0;
  }

  setRaccito(): void {
    // TODO: drop security items
    this.raccito = true;
    this.raccitoCounter = Board.CellsCounter * 2;
  }

  skipTurn(): void {
    this.freezeTurns += 1;
  }
}
