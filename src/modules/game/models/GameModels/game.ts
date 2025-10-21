import { randomBytes } from 'crypto';

import { PropertyCell } from '../FieldModels/cells';
import { ITurnResult, PropertyBoughtResult, PropertyBoughtResultSuccess } from '../types';
import { IGame } from './igame';
import { Player, PlayerColor } from './player';
import { Turn } from './turn';

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
    if(!propertyIndex || !playerId) {
      playerId = this.players[this.currentPlayer].Id;
      propertyIndex = this.players[this.currentPlayer].Position;
    }
    const newOwner = this.players.find(player => player.Id === playerId)!;
    const property = this.board.cells.flat()[propertyIndex];
    if (PropertyCell.isPropertyCell(property) === false) {
      throw new Error('Current cell is not a property');
    }

    if(!price) {
      price = property.object.price;
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
    return {propertyIndex, newOwnerId: newOwner.Id, success: true};
  }

  handlePlayerMoved(): void {
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

  public nextTurn(playerId: string, diceCounter?: number): ITurnResult {
    const result: ITurnResult = {};
    if (!this.isPlayerActive(playerId)) {
      throw new Error(`It's not player ${playerId} turn`);
    }

    if (this.currentTurnState === Turn.Trading && diceCounter !== undefined) {
      let rollResult = 0; // Roll a 6-sided dice
      result.diceRoll = [];

      for (let i = 0; i < diceCounter; i++) {
        const rolled = Math.floor(Math.random() * 6) + 1;
        result.diceRoll.push(rolled);
        rollResult += rolled;
      }

      console.log(`Player ${playerId} rolled a ${rollResult}`);

      this.players[this.currentPlayer].move(rollResult);
      result.newPlayerPosition = this.players[this.currentPlayer].Position;
    } else if (this.currentTurnState === Turn.Event) {
      // event handling logic
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
