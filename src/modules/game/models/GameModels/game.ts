import { randomBytes } from 'crypto';

import { EventItem, EventType, GameEvent } from '../events';
import { Cards, getCardsByType } from '../FieldModels/cards';
import {
  CardEventCell,
  CardEventCellTypes,
  EventCell, InteractiveEventCell, PropertyCell, StaticEventCell,
} from '../FieldModels/cells';
import { IDiceResult, IEventResult, ITurnResult, PropertyBoughtResultSuccess, RollTurnResult } from '../types';
import { IGame } from './igame';
import { ItemType } from './items';
import { Player, PlayerColor } from './player';
import { Business, BussinessGrade, GovBusiness } from './properties';
import { GameStateType, StateManager } from './state-manager';
import { Turn } from './turn';

// Type constraint to ensure the method has playerId as first parameter
type MethodWithPlayerId<T extends unknown[], R> = (playerId: string, ...args: T) => R;

// Decorator to validate that the player is active
function ValidateActivePlayer<T extends unknown[], R>(
  target: unknown,
  propertyKey: string,
  descriptor: TypedPropertyDescriptor<MethodWithPlayerId<T, R>>,
): TypedPropertyDescriptor<MethodWithPlayerId<T, R>> {
  const originalMethod = descriptor.value!;

  descriptor.value = function(this: Game, playerId: string, ...args: T): R {
    if (!this.isPlayerActive(playerId)) {
      throw new Error(`It's not player ${playerId} turn`);
    }
    return originalMethod.apply(this, [playerId, ...args]);
  };

  return descriptor;
}

// Decorator to require specific game state
function RequireGameState(requiredState: GameStateType) {
  return function(
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const originalMethod = descriptor.value!;

    descriptor.value = function(this: Game, ...args: unknown[]): unknown {
      if (!this.stateManager.isStateValid(requiredState)) {
        const currentState = this.stateManager.state;
        throw new Error(
          `Action not allowed in current game state. Required: ${requiredState}, Current: ${currentState}`,
        );
      }
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

export interface PlayersSettings {
  id: string;
  name: string;
}

export class Game extends IGame {
  public override readonly id: string;
  public override readonly players: Player[];
  public readonly stateManager: StateManager = new StateManager();

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

  /** transfer money from other player to current player (eg birthday) */
  private transferMoney(amount: number): void {
    for (const player of this.players) {
      if (player.Id !== this.players[this.CurrentPlayer].Id) {
        player.changeMoney(-amount);
      } else {
        player.changeMoney(amount * (this.players.length - 1));
      }
    }
  }

  /** current player wants to buy property */
  buyProperty(): PropertyBoughtResultSuccess;
  /** players trade */
  buyProperty(playerId: string, propertyIndex: number, price: number): PropertyBoughtResultSuccess;
  buyProperty(playerId?: string, propertyIndex?: number, price?: number): PropertyBoughtResultSuccess {
    let oldOwnerId: string | null | undefined = undefined;
    if(!propertyIndex || !playerId) {
      playerId = this.players[this.currentPlayer].Id;
      propertyIndex = this.players[this.currentPlayer].Position;
      oldOwnerId = null;
    }
    const newOwner = this.players.find(player => player.Id === playerId)!;
    const property = this.board.cells.flat()[propertyIndex];

    if (PropertyCell.isPropertyCell(property) === false) {
      throw new Error('Current cell is not a property');
    }

    if(!price && oldOwnerId !== null) {
      throw new Error('Price must be specified when buying from another player');
    }
    if(!price) {
      price = property.object.price;
    }
    if(oldOwnerId !== null) {
      oldOwnerId = property.object.owner;
    }

    if (property.object.owner === playerId) {
      throw new Error('Property is already owned by the player');
    }
    if(newOwner.Money < price) {
      throw new Error('Insufficient funds');
    }

    if (property.object.owner && property.object.owner !== playerId) {
      // we have to sell property from previous owner
      const prevOwner = this.players.find(player => player.Id === property.object.owner)!;
      if(!prevOwner) {
        throw new Error('Previous owner not found! CRITICAL ERROR');
      }
      prevOwner.changeMoney(price);
      // player?.move
      property.object.owner = null;
    }

    property.object.owner = newOwner.Id;
    console.log('Property bought:', { propertyIndex, newOwnerId: newOwner.Id });
    newOwner.changeMoney(-price);
    return {propertyIndex, newOwnerId: newOwner.Id, success: true, price, oldOwnerId};
  }

  @RequireGameState(GameStateType.Active)
  handleCardEvent(card: GameEvent, randomKey: string): IEventResult[] {
    const results: IEventResult[] = [];
    results.push({cardDrawn: {cardKey: randomKey, card}});
    switch(card.type) {
      case EventType.BalanceChange:
        this.players[this.CurrentPlayer].changeMoney(card.amount);
        break;
      case EventType.SkipTurn:
        this.players[this.CurrentPlayer].skipTurn();
        break;
      case EventType.Move:
        this.players[this.CurrentPlayer].move(card.amount);
        break;
      case EventType.MovePlayer:
        // TODO: set game to waiting for action to select player to move
        break;
      case EventType.MoveTo: {
        const currentPosition = this.players[this.CurrentPlayer].Position;
        const targetPosition = this.board.flatCells.findIndex((cell) => {
          return cell.name === card.to;
        });
        const movesCounter = currentPosition < targetPosition ?
          targetPosition - currentPosition :
          this.board.flatCells.length - currentPosition + targetPosition;
        this.players[this.CurrentPlayer].move(movesCounter);
        // trigger cells event after moving
        // this.handlePlayerMoved(playerId);
        break;
      }
      case EventType.MoveToCenter:
        // TODO: set game to waiting for action to move to center or not
        break;
      case EventType.GetEvent:
        switch(card.item) {
          // Handle different items if needed
          case EventItem.Mail:
            results.push(...this.prepareCard('post'));
            break;
          case EventItem.Risk:
            results.push(...this.prepareCard('risk'));
            break;
          case EventItem.Surprise:
            results.push(...this.prepareCard('surprise'));
            break;
          case EventItem.TaxFree:
            this.players[this.CurrentPlayer].giveItem(ItemType.TaxFree);
            results.push({itemReceived: ItemType.TaxFree});
            break;
          case EventItem.Security:
            this.players[this.CurrentPlayer].giveItem(ItemType.Security);
            results.push({itemReceived: ItemType.Security});
            break;
          default:
            throw new Error('Unknown event item!');
        }
        break;
      case EventType.MoneyTransfer:
        this.transferMoney(card.amount);
        break;
      case EventType.PropertyLoss:
        this.loseProperty(card.grade);
        break;
      case EventType.TaxService: {
        const currPos = this.players[this.CurrentPlayer].Position;
        const newPos = this.board.flatCells.findIndex((cell) => {
          return StaticEventCell.isStaticEventCell(cell) && cell.type === EventType.TaxService;
        });
        const moves = +(newPos - currPos);
        this.players[this.CurrentPlayer].move(moves);
        console.log('move player', this.CurrentPlayer, 'to', newPos);
        break;
      }

      default:
        throw new Error('Unknown event type!');
    }

    return results;
  }

  @RequireGameState(GameStateType.Active)
  handleEvent(cell: EventCell): IEventResult[] {
    const result: IEventResult[] = [];
    console.log('handle event cell');
    if(cell instanceof CardEventCell) {
      result.push(...this.prepareCard(cell.type));
    } else if(cell instanceof StaticEventCell) {
      console.log('static event cell');
      switch(cell.type) {
        // nothing to do, handled when player tries to move
        case EventType.TaxService:
          break;
        case EventType.BalanceChange:
          this.players[this.CurrentPlayer].changeMoney(cell.amount ?? 0);
          break;
        case EventType.SkipTurn:
          this.players[this.CurrentPlayer].skipTurn();
          break;
        default:
          throw new Error('Unknown static event cell type');
      }

      result.push({staticEvent: cell.type});
    } else if(cell instanceof InteractiveEventCell) {
      // TODO: Set game state to waiting for player action?
      switch(cell.type) {
        case EventType.Raccito:
        case EventType.MoveToCenter: break;
        default:
          throw new Error(`Unknown interactive event cell type: ${cell.type}`);
      }
      console.log('interactive event cell');
      result.push({interactiveEvent: cell.type});
    } else {
      throw new Error('Unknown event cell type');
    }

    return result;
  }

  @RequireGameState(GameStateType.Active)
  @ValidateActivePlayer
  handlePlayerMoved(playerId: string): [IEventResult[]] {
    const results: [IEventResult[]] = [[]];
    const result = results[0];
    const position = this.players[this.CurrentPlayer].Position;
    const cell = this.board.flatCells[position];
    if (PropertyCell.isPropertyCell(cell) && cell.object.owner && cell.object.owner !== playerId) {
      // pay tax to the owner
      const { tax } = cell.object;
      this.players[this.CurrentPlayer].changeMoney(-tax);
      this.players.find(p => p.Id === cell.object.owner)!.changeMoney(tax);
      result.push({taxPaid: { amount: tax, toPlayerId: cell.object.owner }});
    } else if (PropertyCell.isPropertyCell(cell) &&
      GovBusiness.isGovBusiness(cell.object) &&
      cell.object.owner === null) {
      // Gov business - give 'G' to player
    } else if(cell instanceof EventCell) {
      result.push(...this.handleEvent(cell));
    } else {
      console.log('nothing to do', cell.name);
    }
    console.log(`Player ${playerId} moved`);
    return results;

    // TODO
    /**
     * Possible cells:
     * - properties
     * -- owned -> nothing
     * -- unowned -> if Gov - give 'G'
     * -- opponent owned -> pay tax/racet
     * - events -> doing...
     */
  }

  @RequireGameState(GameStateType.Active)
  loseProperty(grade: BussinessGrade.Enterprise | BussinessGrade.Office): IEventResult[] {
    const results: IEventResult[] = [];
    const validPropsToLose = this.board.flatCells
      .filter((cell) => PropertyCell.isPropertyCell(cell))
      .filter((cell) => cell.object.owner === this.players[this.CurrentPlayer].Id)
      .filter((cell) => Business.isBusiness(cell.object) && cell.object.grade === grade);
    if (validPropsToLose.length === 0) {
      console.log('No properties to lose for grade', grade);
      results.push({propertyLost: {propertyIndex: null}});
    } else {
      const randomIndex = Math.floor(Math.random() * validPropsToLose.length);
      const propertyToLose = validPropsToLose[randomIndex];
      propertyToLose.object.owner = null;
      results.push({propertyLost: {propertyIndex: this.board.flatCells.indexOf(propertyToLose)}});
      console.log('Property lost:', propertyToLose);
    }

    return results;
  }

  @RequireGameState(GameStateType.Active)
  @ValidateActivePlayer
  public nextTurn(playerId: string, diceCounter?: number): ITurnResult {
    const result: ITurnResult = {};
    // TODO: add tax service special handling

    if (this.currentTurnState === Turn.Trading && diceCounter !== undefined) {
      const diceResult: IDiceResult = {};
      let rollResult = 0; // Roll a 6-sided dice
      diceResult.diceRoll = [];

      for (let i = 0; i < diceCounter; i++) {
        const rolled = Math.floor(Math.random() * 6) + 1;
        diceResult.diceRoll.push(rolled);
        rollResult += rolled;
      }

      console.log(`Player ${playerId} rolled a ${rollResult}`);

      // DEBUG:
      diceResult.diceRoll = [4];
      rollResult = 4;
      this.players[this.currentPlayer].move(rollResult);
      diceResult.newPlayerPosition = this.players[this.currentPlayer].Position;

      const turnProgressData: RollTurnResult = {
        success: true,
        data: {
          diceResult,
          currentPlayer: this.currentPlayer,
          turn: this.currentTurnState,
        },
        message: 'Turn processed successfully',
      };
      result.turn_progress = [turnProgressData];
      const eventResults = this.handlePlayerMoved(playerId);
      result.event_result = eventResults;
    } else if (this.currentTurnState === Turn.Event) {
      result.turn_finished = [{
        success: true,
        message: 'Turn finished successfully',
      }];
    } else {
      throw new Error('Invalid turn state or missing diceCounter');
    }

    this.currentTurnState = this.currentTurnIterator.next().value;
    // check if turn is over
    if (this.currentTurnState === Turn.Trading) {
      this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
    }
    return result;
  }

  @RequireGameState(GameStateType.Active)
  prepareCard(type: CardEventCellTypes): IEventResult[] {
    const deck = getCardsByType(type);
    const cardKeys: (keyof Cards)[] = Object.keys(deck);
    const randomKey: keyof Cards = cardKeys[Math.floor(Math.random() * cardKeys.length)];
    const card = deck[randomKey as keyof typeof deck];
    console.log('prepare card', card.type);
    console.log('Drew card:', card);

    // REMOVE: reminder - handle move to center/player events!
    // todo: check if type of randomKey is valid
    // result.push({cardDrawn: {cardKey: randomKey, card}});
    return this.handleCardEvent(card, `${randomKey}`);
  }

}
