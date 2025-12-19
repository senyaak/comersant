import { randomBytes } from 'crypto';

import { EventItem, EventType, GameEvent } from '../events';
import { Board } from '../FieldModels/board';
import { Cards, getCardsByType } from '../FieldModels/cards';
import {
  CardEventCell,
  CardEventCellTypes,
  EventCell, InteractiveEventCell, PropertyCell, StaticEventCell,
  TaxServiceCell,
} from '../FieldModels/cells';
import { IDiceResult, IEventResult, ITurnResult, PropertyBoughtResultSuccess, RollTurnResult } from '../types';
import { GamePlayerEventType, TradingEvent } from './gamePlayerEvent';
import { IGame } from './igame';
import { ItemType } from './items';
import { Player, PlayerColor } from './player';
import { Business, BusinessGrade, GovBusiness } from './properties';
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
  const originalMethod = descriptor.value;

  descriptor.value = function(this: Game, playerId: string, ...args: T): R {
    if (!this.isPlayerActive(playerId)) {
      throw new Error(`It's not player ${playerId} turn`);
    }
    return originalMethod?.apply(this, [playerId, ...args]);
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
    const originalMethod = descriptor.value;

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
  private auctionFinishCallback: ((result: {
    success: boolean;
    propertyIndex: number;
    purchaseResult?: PropertyBoughtResultSuccess;
  }) => void) | null = null;

  private auctionTickInterval: NodeJS.Timeout | null = null;
  private auctionTimer: NodeJS.Timeout | null = null;
  private auctionUpdateCallback: ((eventData: TradingEvent['eventData']) => void) | null = null;

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

  private finishAuction(completeSale: boolean): {
    success: boolean;
    propertyIndex: number;
    purchaseResult?: PropertyBoughtResultSuccess;
  } | null {
    if (!this.eventInProgress || this.eventInProgress.type !== GamePlayerEventType.Trading) {
      return null;
    }

    if (this.auctionTimer) {
      clearTimeout(this.auctionTimer);
      this.auctionTimer = null;
    }

    if (this.auctionTickInterval) {
      clearInterval(this.auctionTickInterval);
      this.auctionTickInterval = null;
    }

    const { eventData } = this.eventInProgress;

    let success = false;
    const propertyIndex = eventData.propertyIndex;
    let purchaseResult: PropertyBoughtResultSuccess | undefined;

    if (completeSale && eventData.currentBidderIndex !== null) {
      // Complete the purchase
      const winnerId = this.players[eventData.currentBidderIndex].Id;
      purchaseResult = this.buyProperty(winnerId, eventData.propertyIndex, eventData.price);
      success = true;
    }

    // Notify clients about auction end
    if (this.auctionUpdateCallback) {
      this.auctionUpdateCallback(eventData);
    }

    // Clear event and return to active state
    this.eventInProgress = null;
    this.stateManager.clearWaiting();
    this.auctionUpdateCallback = null;

    // Notify about auction finish
    if (this.auctionFinishCallback) {
      this.auctionFinishCallback({ success, propertyIndex, purchaseResult });
      this.auctionFinishCallback = null;
    }

    return { success, propertyIndex, purchaseResult };
  }

  private moveTo(player: Player, targetPosition: number): void {
    const currentPosition = player.Position;
    const movesCounter = Math.abs(targetPosition - currentPosition);
    player.move(movesCounter);
  }

  private moveToTaxService(): void {
    const currPos = this.players[this.CurrentPlayerIndex].Position;
    const newPos = this.board.flatCells.findIndex((cell) =>
      TaxServiceCell.isTaxServiceCell(cell),
    );
    const moves = Math.abs(newPos - currPos);
    this.players[this.CurrentPlayerIndex].move(moves);
    console.log('move player', this.CurrentPlayerIndex, 'to', newPos);
  }

  private startAuctionTimer(): void {
    if (this.auctionTimer) {
      clearTimeout(this.auctionTimer);
    }
    if (this.auctionTickInterval) {
      clearInterval(this.auctionTickInterval);
    }

    // Set initial time
    if (this.eventInProgress?.type === GamePlayerEventType.Trading) {
      this.eventInProgress.eventData.timeRemaining = 10;
    }

    // Update timer every second
    this.auctionTickInterval = setInterval(() => {
      if (this.eventInProgress?.type === GamePlayerEventType.Trading) {
        this.eventInProgress.eventData.timeRemaining -= 1;

        // Notify clients about time update
        if (this.auctionUpdateCallback) {
          this.auctionUpdateCallback(this.eventInProgress.eventData);
        }

        if (this.eventInProgress.eventData.timeRemaining <= 0) {
          if (this.auctionTickInterval) {
            clearInterval(this.auctionTickInterval);
            this.auctionTickInterval = null;
          }
          // Finish auction when time runs out
          this.finishAuction(true);
        }
      }
    }, 1000);

    // Finish auction after 10 seconds (backup, should be handled by interval)
    this.auctionTimer = setTimeout(() => {
      this.finishAuction(true);
    }, 10000);
  }

  /** transfer money from other player to current player (eg birthday) */
  private transferMoney(amount: number): void {
    for (const player of this.players) {
      if (player.Id !== this.players[this.CurrentPlayerIndex].Id) {
        player.changeMoney(-amount);
      } else {
        player.changeMoney(amount * (this.players.length - 1));
      }
    }
  }

  /**
   * Pass on auction/first offer
   */
  @RequireGameState(GameStateType.WaitingForPropertyAction)
  public auctionPass(
    playerId: string,
    onUpdate?: (eventData: TradingEvent['eventData']) => void,
    onFinish?: (result: {
      success: boolean;
      propertyIndex: number;
      purchaseResult?: PropertyBoughtResultSuccess;
    }) => void,
  ): TradingEvent['eventData'] {
    if (!this.eventInProgress || this.eventInProgress.type !== GamePlayerEventType.Trading) {
      throw new Error('No trading event in progress');
    }

    const { eventData } = this.eventInProgress;
    const playerIndex = this.players.findIndex(p => p.Id === playerId);

    if (playerIndex === -1) {
      throw new Error('Player not found');
    }

    // Handle first buy offer refusal - START AUCTION
    if (eventData.playerIndices.length === 1 && eventData.playerIndices[0] === playerIndex) {
      // Start auction for all players (including the one who refused first offer)
      const allPlayerIndices = this.players.map((_, idx) => idx);
      eventData.playerIndices = allPlayerIndices;
      eventData.passedPlayerIndices = []; // Reset - refusing first offer doesn't count as auction pass
      eventData.timeRemaining = 10;
      eventData.isLocked = false;

      // Store callbacks
      if (onUpdate) {
        this.auctionUpdateCallback = onUpdate;
      }
      if (onFinish) {
        this.auctionFinishCallback = onFinish;
      }

      // Start auction timer
      this.startAuctionTimer();
      return eventData;
    }

    // Handle auction pass
    if (!eventData.playerIndices.includes(playerIndex)) {
      throw new Error('Player cannot participate in this auction');
    }

    if (eventData.passedPlayerIndices.includes(playerIndex)) {
      throw new Error('Player already passed');
    }

    // Add player to passed list
    eventData.passedPlayerIndices.push(playerIndex);

    // Check if all players passed
    const activePlayers = eventData.playerIndices.filter(idx => !eventData.passedPlayerIndices.includes(idx));
    if (activePlayers.length === 0) {
      // Everyone passed, end auction without sale
      this.finishAuction(false);
    }

    return eventData;
  }

  /**
   * Place a bid in the auction
   */
  @RequireGameState(GameStateType.WaitingForPropertyAction)
  public auctionPlaceBid(
    playerId: string,
    bidAmount: number,
    onUnlock?: (eventData: TradingEvent['eventData']) => void,
  ): TradingEvent['eventData'] {
    if (!this.eventInProgress || this.eventInProgress.type !== GamePlayerEventType.Trading) {
      throw new Error('No trading event in progress');
    }

    const { eventData } = this.eventInProgress;
    const playerIndex = this.players.findIndex(p => p.Id === playerId);

    if (playerIndex === -1) {
      throw new Error('Player not found');
    }

    // Check if auction is active (more than 1 player can participate)
    if (eventData.playerIndices.length === 1) {
      throw new Error('Auction not started yet. Use buyProperty or refuseFirstBuyOffer first');
    }

    // Check if auction is locked
    if (eventData.isLocked) {
      throw new Error('Auction is locked for 1 second after last bid');
    }

    // Check if player already passed
    if (eventData.passedPlayerIndices.includes(playerIndex)) {
      throw new Error('Player already passed on this auction');
    }

    // Check if player can participate
    if (!eventData.playerIndices.includes(playerIndex)) {
      throw new Error('Player cannot participate in this auction');
    }

    // Check if bid is higher than current
    if (bidAmount <= eventData.price) {
      throw new Error(`Bid must be higher than current price ${eventData.price}`);
    }

    // Check if player has enough money
    const player = this.players[playerIndex];
    if (player.Money < bidAmount) {
      throw new Error('Insufficient funds');
    }

    // Update auction state
    eventData.price = bidAmount;
    eventData.currentBidderIndex = playerIndex;
    eventData.isLocked = true;
    eventData.timeRemaining = 10;

    // Clear existing timers
    if (this.auctionTimer) {
      clearTimeout(this.auctionTimer);
      this.auctionTimer = null;
    }
    if (this.auctionTickInterval) {
      clearInterval(this.auctionTickInterval);
      this.auctionTickInterval = null;
    }

    // Lock for 1 second, then unlock and start 10 second timer
    setTimeout(() => {
      if (this.eventInProgress && this.eventInProgress.type === GamePlayerEventType.Trading) {
        this.eventInProgress.eventData.isLocked = false;
        this.startAuctionTimer();
        // Notify clients about unlock
        if (onUnlock) {
          onUnlock(this.eventInProgress.eventData);
        }
      }
    }, 1000);

    return eventData;
  }

  /** current player wants to buy property */
  buyProperty(): PropertyBoughtResultSuccess;
  /** players trade */
  buyProperty(playerId: string, propertyIndex: number, price: number): PropertyBoughtResultSuccess;
  buyProperty(playerId?: string, propertyIndex?: number, price?: number): PropertyBoughtResultSuccess {
    let oldOwnerId: string | null | undefined = undefined;
    if(!propertyIndex || !playerId) {
      playerId = this.players[this.currentPlayerIndex].Id;
      propertyIndex = this.players[this.currentPlayerIndex].Position;
      oldOwnerId = null;
    }
    const newOwner = this.players.find(player => player.Id === playerId);
    if(!newOwner) {
      throw new Error('Player not found');
    }
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
      const prevOwner = this.players.find(player => player.Id === property.object.owner);
      if(!prevOwner) {
        throw new Error('Previous owner not found! CRITICAL ERROR');
      }
      prevOwner.changeMoney(price);
      // player?.move
      property.object.owner = null;
    }

    property.object.owner = newOwner.Id;
    newOwner.changeMoney(-price);

    // Clear event and return to active state if this was part of trading event
    if (this.eventInProgress?.type === GamePlayerEventType.Trading) {
      this.eventInProgress = null;
      if (this.auctionTimer) {
        clearTimeout(this.auctionTimer);
        this.auctionTimer = null;
      }
      this.stateManager.clearWaiting();
    }

    return {propertyIndex, newOwnerId: newOwner.Id, success: true, price, oldOwnerId};
  }

  @RequireGameState(GameStateType.Active)
  handleCardEvent(card: GameEvent, cardType: CardEventCellTypes): IEventResult[] {
    const results: IEventResult[] = [];
    results.push({cardDrawn: {cardType, card}});
    switch(card.type) {
      case EventType.BalanceChange:
        this.players[this.CurrentPlayerIndex].changeMoney(card.amount);
        break;
      case EventType.SkipTurn:
        this.players[this.CurrentPlayerIndex].skipTurn();
        break;
      case EventType.Move:
        this.players[this.CurrentPlayerIndex].move(card.amount);
        break;
      case EventType.MovePlayer:
        // TODO: set game to waiting for action to select player to move
        break;
      case EventType.MoveTo: {
        const targetPosition = Board.getTargetPosition(card.to);
        this.moveTo(this.players[this.CurrentPlayerIndex], targetPosition);
        break;
      }
      case EventType.MoveToCenter:
        this.stateManager.setWaiting(
          GameStateType.WaitingForMoveToCenter,
          [this.players[this.CurrentPlayerIndex].Id],
        );
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
            this.players[this.CurrentPlayerIndex].giveItem(ItemType.TaxFree);
            results.push({itemReceived: ItemType.TaxFree});
            break;
          case EventItem.Security:
            this.players[this.CurrentPlayerIndex].giveItem(ItemType.Security);
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
        this.moveToTaxService();
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
      let staticEvent: IEventResult['staticEvent'];
      switch(cell.type) {
        case EventType.TaxService:
          this.moveToTaxService();
          staticEvent = {eventType: EventType.TaxService};
          break;
        case EventType.BalanceChange:
          this.players[this.CurrentPlayerIndex].changeMoney(cell.amount ?? 0);
          staticEvent = {eventType: EventType.BalanceChange, amount: cell.amount};
          break;
        case EventType.SkipTurn:
          this.players[this.CurrentPlayerIndex].skipTurn();
          staticEvent = {eventType: EventType.SkipTurn};
          break;
        default:
          throw new Error('Unknown static event cell type');
      }

      result.push({ staticEvent });
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
  handlePlayerMoved(playerId: string): IEventResult[] {
    const results: IEventResult[] = [];
    const position = this.players[this.CurrentPlayerIndex].Position;
    const cell = this.board.flatCells[position];
    if (PropertyCell.isPropertyCell(cell)) {
      results.push(...this.handleStepOnProperty(playerId, cell));
    } else if(cell instanceof EventCell) {
      results.push(...this.handleEvent(cell));
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
  @ValidateActivePlayer
  handleStepOnProperty(playerId: Player['id'], cell: PropertyCell): IEventResult[] {
    const results: IEventResult[] = [];

    if (cell.object.owner && cell.object.owner !== playerId) {
      // pay tax to the owner
      const { tax } = cell.object;
      this.players[this.CurrentPlayerIndex].changeMoney(-tax);
      const owner = this.players.find(p => p.Id === cell.object.owner);
      if(!owner) {
        throw new Error('Owner not found');
      }
      owner.changeMoney(tax);
      results.push({taxPaid: { amount: tax, toPlayerId: cell.object.owner }});
    } else if(cell.object.owner === null) {
      this.stateManager.setWaiting(GameStateType.WaitingForPropertyAction, [this.players[this.CurrentPlayerIndex].Id]);
      // first buy offer for current player
      const propertyIndex = this.board.flatCells.indexOf(cell);
      const eventData: TradingEvent['eventData'] = {
        playerIndices: [this.CurrentPlayerIndex],
        price: cell.object.price,
        propertyIndex,
        currentBidderIndex: null,
        passedPlayerIndices: [],
        timeRemaining: 0,
        isLocked: false,
      };
      this.eventInProgress = {type: GamePlayerEventType.Trading, eventData};
      results.push({trading: eventData});
    }

    if (GovBusiness.isGovBusiness(cell.object) &&
      cell.object.owner === null) {
      // Gov business - give 'G' to player
      // TODO: define concept
    }

    return results;
  }

  @RequireGameState(GameStateType.Active)
  loseProperty(grade: BusinessGrade.Enterprise | BusinessGrade.Office): IEventResult[] {
    const results: IEventResult[] = [];
    const validPropsToLose = this.board.flatCells
      .filter((cell) => PropertyCell.isPropertyCell(cell))
      .filter((cell) => cell.object.owner === this.players[this.CurrentPlayerIndex].Id)
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

  @RequireGameState(GameStateType.WaitingForMoveToCenter)
  @ValidateActivePlayer
  public moveToCenter(playerId: string, newPosition: number): IEventResult[] {
    const isPosition = newPosition >= Board.Cells[0].length && newPosition < Board.CellsCounter;
    if(!isPosition) {
      throw new Error('Invalid cell index for move to center');
    }
    const player = this.players.find(p => p.Id === playerId);
    if(!player) {
      throw new Error('Player not found');
    }
    this.moveTo(player, newPosition);
    return [];
  }

  @RequireGameState(GameStateType.Active)
  @ValidateActivePlayer
  public nextTurn(playerId: string, diceCounter?: number): ITurnResult {
    const result: ITurnResult = {};
    // TODO: add tax service special handling

    if (this.currentTurnState === Turn.Trading && diceCounter !== undefined) {
      const diceResult: IDiceResult = {diceRoll: []};
      let rollResult = 0; // Roll a 6-sided dice
      // diceResult.diceRoll = [];

      for (let i = 0; i < diceCounter; i++) {
        const rolled = Math.floor(Math.random() * 6) + 1;
        diceResult.diceRoll.push(rolled);
        rollResult += rolled;
      }

      console.log(`Player ${playerId} rolled a ${rollResult}`);

      // DEBUG:
      diceResult.diceRoll = [1];
      rollResult = 1;
      this.players[this.currentPlayerIndex].move(rollResult);
      diceResult.newPlayerPosition = this.players[this.currentPlayerIndex].Position;

      const turnProgressData: RollTurnResult = {
        success: true,
        data: {
          diceResult,
          currentPlayer: this.currentPlayerIndex,
          turn: this.currentTurnState,
        },
        message: 'Turn processed successfully',
      };
      result.turn_progress = [turnProgressData];
      const eventResults = this.handlePlayerMoved(playerId);
      result.event_result = [eventResults];

      // todo: add trade state if property not owned
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
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    }
    return result;
  }

  @RequireGameState(GameStateType.Active)
  prepareCard(type: CardEventCellTypes): IEventResult[] {
    const deck = getCardsByType(type);
    const cardKeys: (keyof Cards)[] = Object.keys(deck);
    const randomKey: keyof Cards = cardKeys[Math.floor(Math.random() * cardKeys.length)];
    const card = deck[randomKey as keyof typeof deck];

    // REMOVE: reminder - handle move to center/player events!
    // todo: check if type of randomKey is valid
    // result.push({cardDrawn: {cardKey: randomKey, card}});
    return this.handleCardEvent(card, type);
  }
}
