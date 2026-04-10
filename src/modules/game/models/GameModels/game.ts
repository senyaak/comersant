import { randomBytes } from 'crypto';
import { EventEmitter } from 'events';

import { Board } from '../FieldModels/board';
import { EventCell, PropertyCell } from '../FieldModels/cells';
import {
  IDiceResult,
  ITurnResult,
  PropertyBoughtResultSuccess,
  RollTurnResult,
  TradingActionResult,
} from '../types';
import {
  InsufficientPlayersError,
  InvalidCellIndexError,
  InvalidTurnStateError,
  NoTradingEventError,
  NotAPropertyCellError,
  PlayerNotFoundError,
  UnhandledEffectError,
} from './errors';
import { computeAuctionBid, computeAuctionPass } from './game/domains/auction';
import { computeEventCell } from './game/domains/cards';
import { computeMove, computeMoveToPosition } from './game/domains/movement';
import {
  computeBuyProperty,
  computeLoseProperty,
  computePropertyStep,
} from './game/domains/properties';
import { GameEffect } from './game/effects';
import { RequireGameState, ValidateActivePlayer } from './game/validators';
import { GamePlayerEventType, TradingEvent } from './gamePlayerEvent';
import { IGame } from './igame';
import { Player, PlayerColor } from './player';
import { BusinessGrade } from './properties';
import { GameStateType, StateManager } from './state-manager';
import { Turn } from './turn';

export interface PlayersSettings {
  id: string;
  name: string;
}

export class Game extends IGame {
  public readonly events = new EventEmitter();
  public override readonly id: string;
  public override readonly players: Player[];
  public readonly stateManager: StateManager = new StateManager();

  constructor(players: { id: string, name: string }[]) {
    super();
    if (players.length < 2) {
      throw new InsufficientPlayersError();
    }
    this.id = randomBytes(16).toString('hex');
    this.players = players.map((player, counter) => {
      return new Player(player.id, Object.values(PlayerColor)[counter], player.name);
    });
    for (const player of this.players) {
      player.onEliminated(() => this.handlePlayerEliminated(player));
    }
  }

  // ─── Effect dispatcher ─────────────────────────────────────────────────────

  private advanceToNextActivePlayer(): void {
    do {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    } while (this.players[this.currentPlayerIndex].Eliminated);
  }

  private applyEffect(effect: GameEffect): void {
    switch (effect.type) {

      // Movement
      case 'PLAYER_MOVED':
        this.players[effect.playerIndex].move(effect.steps);
        break;
      case 'PLAYER_MOVED_TO_POSITION': {
        const player = this.players[effect.playerIndex];
        const steps = Math.abs(effect.targetPosition - player.Position);
        player.move(steps);
        break;
      }

      // Auction
      case 'AUCTION_OPENED_TO_ALL':
        if (this.eventInProgress?.type === GamePlayerEventType.Trading) {
          this.eventInProgress.eventData.playerIndices = effect.playerIndices;
          this.eventInProgress.eventData.passedPlayerIndices = [];
          this.stateManager.setWaiting(
            GameStateType.WaitingForPropertyAction,
            this.players.map(p => p.Id),
          );
        }
        break;
      case 'AUCTION_PLAYER_PASSED':
        if (this.eventInProgress?.type === GamePlayerEventType.Trading) {
          this.eventInProgress.eventData.passedPlayerIndices.push(effect.playerIndex);
        }
        break;
      case 'AUCTION_FAILED':
        this.eventInProgress = null;
        this.stateManager.clearWaiting();
        break;
      case 'AUCTION_BID_PLACED':
        if (this.eventInProgress?.type === GamePlayerEventType.Trading) {
          this.eventInProgress.eventData.price = effect.price;
          this.eventInProgress.eventData.currentBidderIndex = effect.playerIndex;
        }
        break;
      case 'AUCTION_BID_INVALID':
        break;

      // Properties
      case 'PROPERTY_OFFERED': {
        const player = this.players[effect.playerIndex];
        this.stateManager.setWaiting(GameStateType.WaitingForPropertyAction, [player.Id]);
        const eventData: TradingEvent['eventData'] = {
          playerIndices: [effect.playerIndex],
          price: effect.price,
          propertyIndex: effect.propertyIndex,
          currentBidderIndex: null,
          passedPlayerIndices: [],
        };
        this.eventInProgress = { type: GamePlayerEventType.Trading, eventData };
        break;
      }
      case 'TAX_PAID':
        this.players[effect.fromPlayerIndex].changeMoney(-effect.amount);
        this.players.find(p => p.Id === effect.toPlayerId)?.changeMoney(effect.amount);
        break;
      case 'PROPERTY_PURCHASED': {
        const buyer = this.players.find(p => p.Id === effect.buyerPlayerId);
        const cell = this.board.flatCells[effect.propertyIndex];
        if (!buyer || !PropertyCell.isPropertyCell(cell)) break;
        if (effect.previousOwnerId) {
          const prevOwner = this.players.find(p => p.Id === effect.previousOwnerId);
          prevOwner?.changeMoney(effect.price);
          cell.object.owner = null;
        }
        cell.object.owner = buyer.Id;
        buyer.changeMoney(-effect.price);
        if (this.eventInProgress?.type === GamePlayerEventType.Trading) {
          this.eventInProgress = null;
          this.stateManager.clearWaiting();
        }
        break;
      }
      case 'PROPERTY_LOST': {
        if (effect.propertyIndex !== null) {
          const cell = this.board.flatCells[effect.propertyIndex];
          if (PropertyCell.isPropertyCell(cell)) {
            cell.object.owner = null;
          }
        }
        break;
      }

      // Cards
      case 'BALANCE_CHANGED':
        this.players[effect.playerIndex].changeMoney(effect.amount);
        break;
      case 'TURN_SKIPPED':
        this.players[effect.playerIndex].skipTurn();
        break;
      case 'ITEM_RECEIVED':
        this.players[effect.playerIndex].giveItem(effect.item);
        break;
      case 'MONEY_TRANSFERRED_FROM_ALL': {
        const currentPlayerId = this.players[effect.centerPlayerIndex].Id;
        for (const player of this.players) {
          if (player.Id === currentPlayerId) {
            player.changeMoney(effect.amount * (effect.playerCount - 1));
          } else {
            player.changeMoney(-effect.amount);
          }
        }
        break;
      }
      case 'WAITING_FOR_MOVE_TO_CENTER':
        this.stateManager.setWaiting(
          GameStateType.WaitingForMoveToCenter,
          [this.players[effect.playerIndex].Id],
        );
        break;
      case 'CARD_DRAWN':
      case 'STATIC_EVENT':
      case 'INTERACTIVE_EVENT':
      case 'MOVE_PLAYER_TODO':
        break;

      default: {
        const _exhaustive: never = effect;
        throw new UnhandledEffectError((_exhaustive as GameEffect).type);
      }
    }
  }

  private handlePlayerEliminated(player: Player): void {
    this.clearOwnedProperties(player);
    this.events.emit('playerEliminated', { playerId: player.Id, playerName: player.Name });
    const alive = this.players.filter(p => !p.Eliminated);
    if (alive.length === 1) {
      this.events.emit('gameOver', { winnerId: alive[0].Id, winnerName: alive[0].Name });
    }
  }

  // ─── IO methods ────────────────────────────────────────────────────────────

  @RequireGameState(GameStateType.WaitingForPropertyAction)
  public auctionPass(playerId: string): TradingActionResult {
    if (!this.eventInProgress || this.eventInProgress.type !== GamePlayerEventType.Trading) {
      throw new NoTradingEventError();
    }
    const playerIndex = this.players.findIndex(p => p.Id === playerId);
    if (playerIndex === -1) throw new PlayerNotFoundError(playerId);

    const prevEventData = { ...this.eventInProgress.eventData };
    const effects = computeAuctionPass(
      this.eventInProgress.eventData, playerIndex, this.players.length,
    );
    for (const e of effects) this.applyEffect(e);

    const failed = effects.find(
      (e): e is Extract<GameEffect, { type: 'AUCTION_FAILED' }> => e.type === 'AUCTION_FAILED',
    );
    if (failed) {
      return { eventData: prevEventData, finished: { success: false, propertyIndex: failed.propertyIndex } };
    }

    return { eventData: this.eventInProgress?.eventData ?? prevEventData };
  }

  @RequireGameState(GameStateType.WaitingForPropertyAction)
  public auctionPlaceBid(playerId: string, bidAmount: number): TradingActionResult {
    if (!this.eventInProgress || this.eventInProgress.type !== GamePlayerEventType.Trading) {
      throw new NoTradingEventError();
    }
    const playerIndex = this.players.findIndex(p => p.Id === playerId);
    if (playerIndex === -1) throw new PlayerNotFoundError(playerId);

    const effects = computeAuctionBid(
      this.eventInProgress.eventData, playerIndex, bidAmount, this.players[playerIndex].Money,
    );
    for (const e of effects) this.applyEffect(e);

    const invalidBid = effects.find(
      (e): e is Extract<GameEffect, { type: 'AUCTION_BID_INVALID' }> => e.type === 'AUCTION_BID_INVALID',
    );
    if (invalidBid) {
      return {
        eventData: this.eventInProgress.eventData,
        invalidBid: { playerIndex: invalidBid.playerIndex, reason: invalidBid.reason },
      };
    }

    return { eventData: this.eventInProgress.eventData };
  }

  /** current player wants to buy property */
  buyProperty(): PropertyBoughtResultSuccess;
  /** players trade */
  buyProperty(playerId: string, propertyIndex: number, price: number): PropertyBoughtResultSuccess;
  buyProperty(playerId?: string, propertyIndex?: number, price?: number): PropertyBoughtResultSuccess {
    let resolvedPlayerId: string;
    let resolvedPropertyIndex: number;
    let resolvedPrice: number;

    if (!playerId || propertyIndex === undefined || price === undefined) {
      resolvedPlayerId = this.players[this.currentPlayerIndex].Id;
      resolvedPropertyIndex = this.players[this.currentPlayerIndex].Position;
      const cell = this.board.flatCells[resolvedPropertyIndex];
      if (!PropertyCell.isPropertyCell(cell)) throw new NotAPropertyCellError(resolvedPropertyIndex);
      resolvedPrice = cell.object.price;
    } else {
      resolvedPlayerId = playerId;
      resolvedPropertyIndex = propertyIndex;
      resolvedPrice = price;
    }

    const effects = computeBuyProperty(
      this.players, this.board.flatCells, resolvedPlayerId, resolvedPropertyIndex, resolvedPrice,
    );
    for (const e of effects) this.applyEffect(e);

    const purchased = effects[0] as Extract<GameEffect, { type: 'PROPERTY_PURCHASED' }>;
    return {
      success: true,
      propertyIndex: purchased.propertyIndex,
      newOwnerId: purchased.buyerPlayerId,
      price: purchased.price,
      oldOwnerId: purchased.previousOwnerId,
    };
  }

  @RequireGameState(GameStateType.Active)
  loseProperty(grade: BusinessGrade.Enterprise | BusinessGrade.Office): GameEffect[] {
    const currentPlayerId = this.players[this.currentPlayerIndex].Id;
    const effects = computeLoseProperty(this.board.flatCells, currentPlayerId, grade);
    for (const e of effects) this.applyEffect(e);
    return effects;
  }

  @RequireGameState(GameStateType.WaitingForMoveToCenter)
  @ValidateActivePlayer
  public moveToCenter(playerId: string, newPosition: number): GameEffect[] {
    const isPosition = newPosition >= Board.Cells[0].length && newPosition < Board.CellsCounter;
    if (!isPosition) throw new InvalidCellIndexError(newPosition);
    if (!this.players.find(p => p.Id === playerId)) throw new PlayerNotFoundError(playerId);

    const effects = computeMoveToPosition(this.currentPlayerIndex, newPosition);
    for (const e of effects) this.applyEffect(e);
    return [];
  }

  @RequireGameState(GameStateType.Active)
  @ValidateActivePlayer
  public nextTurn(playerId: string, diceCounter?: number): ITurnResult {
    const result: ITurnResult = {};

    if (this.currentTurnState === Turn.Trading && diceCounter !== undefined) {
      const diceRoll: number[] = [];
      let rollResult = 0;
      for (let i = 0; i < diceCounter; i++) {
        const rolled = Math.floor(Math.random() * 6) + 1;
        diceRoll.push(rolled);
        rollResult += rolled;
      }

      // DEBUG: force a fixed dice roll for local testing — uncomment to use.
      // diceRoll.length = 0;
      // diceRoll.push(1);
      // rollResult = 1;

      const currentPos = this.players[this.currentPlayerIndex].Position;
      const newPos = (currentPos + rollResult) % Board.CellsCounter;
      const allEffects: GameEffect[] = [...computeMove(this.currentPlayerIndex, rollResult)];

      const cell = this.board.flatCells[newPos];
      if (PropertyCell.isPropertyCell(cell)) {
        allEffects.push(...computePropertyStep(cell, playerId, this.currentPlayerIndex, newPos));
      } else if (cell instanceof EventCell) {
        allEffects.push(...computeEventCell(
          cell, this.currentPlayerIndex, playerId, this.players.length, this.board.flatCells,
        ));
      } else {
        console.log('nothing to do', cell.name);
      }

      for (const e of allEffects) this.applyEffect(e);

      const diceResult: IDiceResult = { diceRoll, newPlayerPosition: newPos };
      const turnProgressData: RollTurnResult = {
        success: true,
        data: { diceResult, currentPlayer: this.currentPlayerIndex, turn: this.currentTurnState },
        message: 'Turn processed successfully',
      };
      result.turn_progress = [turnProgressData];
      result.event_result = [allEffects];

      if (this.players.filter(p => !p.Eliminated).length <= 1) {
        return result;
      }
    } else if (this.currentTurnState === Turn.Event) {
      result.turn_finished = [{ success: true, message: 'Turn finished successfully' }];
    } else {
      throw new InvalidTurnStateError();
    }

    const currentWasEliminated = this.players[this.currentPlayerIndex].Eliminated;

    this.currentTurnState = this.currentTurnIterator.next().value;
    if (this.currentTurnState === Turn.Trading) {
      this.advanceToNextActivePlayer();
    }

    // If current player was just eliminated, auto-advance through their Event phase
    if (currentWasEliminated && this.currentTurnState === Turn.Event) {
      result.turn_finished = [{ success: true, message: 'Turn finished successfully' }];
      this.currentTurnState = this.currentTurnIterator.next().value;
      if (this.currentTurnState === Turn.Trading) {
        this.advanceToNextActivePlayer();
      }
    }

    return result;
  }
}
