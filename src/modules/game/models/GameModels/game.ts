import { randomBytes } from 'crypto';

import { CardEventCell, EventCell, InteractiveEventCell, PropertyCell, StaticEventCell } from '../FieldModels/cells';
import { IDiceResult, ITurnResult, NextTurnResult, PropertyBoughtResultSuccess } from '../types';
import { IGame } from './igame';
import { Player, PlayerColor } from './player';
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

  @ValidateActivePlayer
  handlePlayerMoved(playerId: string): ITurnResult['event_result'] {
    const results: ITurnResult['event_result'] = [{}];
    const position = this.players[this.CurrentPlayer].Position;
    const cell = this.board.flatCells[position];
    if (PropertyCell.isPropertyCell(cell) && cell.object.owner && cell.object.owner !== playerId) {
      // pay tax to the owner
      const { tax } = cell.object;
      this.players[this.CurrentPlayer].changeMoney(-tax);
      this.players.find(p => p.Id === cell.object.owner)!.changeMoney(tax);
      results[0].taxPaid = { amount: tax, toPlayerId: cell.object.owner };
    } else if(cell instanceof EventCell) {
      console.log('event cell');
      if(cell instanceof CardEventCell) {
        console.log('card event cell');
      } else if(cell instanceof StaticEventCell) {
        console.log('static event cell');
      } else if(cell instanceof InteractiveEventCell) {
        console.log('interactive event cell');
      } else {
        throw new Error('Unknown event cell type');
      }
    } else {
      console.log('nothing to do', cell.name);
    }
    console.log(`Player ${playerId} moved`);
    return results;

    // TODO
    /**
     * Possible cells:
     * - properties
     * -- owned
     * -- unowned
     * -- opponent owned
     * - events
     */
  }

  @ValidateActivePlayer
  public nextTurn(playerId: string, diceCounter?: number): ITurnResult {
    const result: ITurnResult = {};

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
      diceResult.diceRoll = [1];
      rollResult = 1;
      this.players[this.currentPlayer].move(rollResult);
      diceResult.newPlayerPosition = this.players[this.currentPlayer].Position;

      const turnProgressData: NextTurnResult = {
        success: true,
        data: {
          diceResult,
          currentPlayer: this.currentPlayer,
          turn: this.currentTurnState,
        },
        message: 'Turn processed successfully',
      };
      result.turn_progress = [turnProgressData];
      this.handlePlayerMoved(playerId);
    } else if (this.currentTurnState === Turn.Event) {
      // event handling logic
      // actually nothing to do here for now
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
}
