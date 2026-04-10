import type { GameEffect } from '$server/modules/game/models/GameModels/game/effects';
import type { IRawGame } from '$server/modules/game/models/GameModels/types';
import type {
  PropertyBoughtResult,
  RollTurnResult,
  TurnFinishedResult,
} from '$server/modules/game/models/types';
import type { ClientToServerEvents, ServerToClientEvents } from '$server/modules/game/services/events/types';
import type { Observable } from 'rxjs';
import type { Socket } from 'socket.io-client';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  Router,
} from '@angular/router';
import { EventType } from '$server/modules/game/models/events';
import { PropertyCell } from '$server/modules/game/models/FieldModels/cells';
import { GamePlayerEventType } from '$server/modules/game/models/GameModels/gamePlayerEvent';
import { IGame } from '$server/modules/game/models/GameModels/igame';
import { Player } from '$server/modules/game/models/GameModels/player';
import { Routes } from '$server/types/routes';
import { BehaviorSubject, tap } from 'rxjs';
import { io } from 'socket.io-client';
import { UserSettingsService } from 'src/app/services/user-settings.service';

import { ICGame } from '../model/ICGame';
import { GameNotificationService } from './game-notification.service';
/**
 * init and stores game data
 * */
@Injectable()
export class GameService {
  private event$ = new BehaviorSubject<IGame['eventInProgress']>(null);
  private game: BehaviorSubject<ICGame> = new BehaviorSubject<ICGame>(new ICGame());
  private socket!: Socket<ServerToClientEvents, ClientToServerEvents>;

  public bidFailed$ = new BehaviorSubject<boolean>(false);
  public diceRolled$ = new BehaviorSubject<RollTurnResult>({ message: 'Game not found', success: false });

  public gameReady$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public playerMoved$ = new BehaviorSubject<boolean>(false);
  public propertyBought$ = new BehaviorSubject<PropertyBoughtResult>({ success: false });
  public spectating$ = new BehaviorSubject<boolean>(false);

  public turnFinished$ = new BehaviorSubject<TurnFinishedResult>(
    { message: 'Unknown error finishing turn', success: false },
  );

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly userSettingsService: UserSettingsService,
    private readonly gameNotificationService: GameNotificationService,
  ) {
    console.log('GameService initialized', this);
    this.game.subscribe(() => {
      this.checkIfReady();
    });
  }

  get canTakeTurn(): boolean {
    return this.isTurnActive && !this.Frozen && !this.Spectating;
  }

  get Event$(): Observable<IGame['eventInProgress'] | null> {
    return this.event$.asObservable();
  }

  private set Event$(event: IGame['eventInProgress']) {
    this.Game.EventInProgress = event;
    this.event$.next(event);
  }

  get Frozen() {
    return this.event$.getValue() !== null;
  }

  get Game() {
    return this.game.getValue();
  }

  get isTurnActive(): boolean {
    return this.Game.CurrentPlayerIndex === this.Game.players.findIndex(
      ({ Id }) => Id === this.Player?.Id,
    );
  }

  get ownedProperties(): Record<Player['id'], PropertyCell[]> {
    return this.Game.board.flatCells.reduce((acc, cell) => {
      if (cell instanceof PropertyCell && cell.object.owner) {
        const ownerId = cell.object.owner;

        if (!acc[ownerId]) {
          acc[ownerId] = [];
        }
        acc[ownerId].push(cell);
      }
      return acc;
    }, {} as Record<Player['id'], PropertyCell[]>);
  }

  get Player() {
    const player = this.Game.players.find(player => player.Id === this.socket.id);
    if (!player) {
      throw new Error('Player not found');
    }
    return player;
  }

  get Socket() {
    return this.socket;
  }

  get Spectating(): boolean {
    return this.spectating$.getValue();
  }

  private checkIfReady() {
    if (this.Socket && this.Player?.Id !== undefined) {
      this.gameReady$.next(true);
    }
  }

  private initSocket() {
    this.socket = io(
      '/game',
      { query: {
        gameId: this.game.getValue().id,
        userName: this.userSettingsService.PlayerName,
      }, forceNew: true },
    );

    this.socket.onAny(this.onAny);
    this.socket.on('connect', this.onConnect);
    this.socket.on('disconnect', this.onDisconnect);
    this.socket.on('user_connected', this.onUserConnected);
    this.socket.on('turn_progress', this.onTurnProgress);
    this.socket.on('turn_finished', this.onTurnFinished);
    this.socket.on('event_result', this.onEventResult);
    this.socket.on('property_bought', this.onPropertyBought);
    this.socket.on('auction_updated', this.onAuctionUpdated);
    this.socket.on('auction_failed', this.onAuctionFailed);
    this.socket.on('bid_failed', this.onBidFailed);
    this.socket.on('player_eliminated', this.onPlayerEliminated);
    this.socket.on('game_over', this.onGameOver);
  }

  private loadGame(gameId: string): Observable<IRawGame> {
    const game$ = this.http.get<IRawGame>(`${Routes.games}/${gameId}`).pipe(
      tap({ next: game => {
        const gameInstance = new ICGame(game);
        this.game.next(gameInstance);

        if (game.eventInProgress) {
          this.event$.next(game.eventInProgress);
        }
      }, error: (err) => {
        console.error('Error loading game:', err);
        this.router.navigate(['/']);
      }}),
    );
    return game$;
  }

  public init(gameId: string | null = null) {
    const id = localStorage.getItem('gameId');
    if (!gameId && id) {
      gameId = id;
    } else if (gameId) {
      localStorage.setItem('gameId', gameId);
    } else {
      throw new Error('gameId is not provided');
    }

    return this.loadGame(gameId).pipe(tap({next: () => {
      this.initSocket();
    }, error: (err) => {
      console.error('Error loading game:', err);
    }})).subscribe();
  }

  //#region Event Handlers
  private onAny = (...rest: unknown[]) => {
    console.log('@#socket on any', rest);
  };

  private onAuctionFailed = (data: Parameters<ServerToClientEvents['auction_failed']>[0]) => {
    // Clear the event
    this.Event$ = null;

    // Show notification
    const cell = this.Game.board.flatCells[data.propertyIndex];
    const propertyName = cell?.name ?? 'Property';
    this.gameNotificationService.toast(`Auction failed for ${propertyName}. No one bid on it.`);
  };

  private onAuctionUpdated = (eventData: Parameters<ServerToClientEvents['auction_updated']>[0]) => {
    if (!this.Game.EventInProgress || this.Game.EventInProgress.type !== GamePlayerEventType.Trading) {
      return;
    }

    if (!eventData) {
      return;
    }

    // Update the event data
    this.Game.EventInProgress.eventData = eventData;
    this.Event$ = this.Game.EventInProgress;
  };

  private onBidFailed = () => {
    // Flash UI for bidder — set true for 1s
    this.bidFailed$.next(true);
    setTimeout(() => this.bidFailed$.next(false), 1000);
  };

  private onConnect = (...rest: unknown[]) => {
    console.log('Connected with query params:', this.socket.io.opts.query);
    console.log('rest', rest);
  };

  private onDisconnect = () => {
    this.socket.disconnect();
    this.router.navigate(['/']);
  };

  private onEventResult = (effects: GameEffect[]) => {
    let i = 0;
    const schedule = (fn: () => void) => setTimeout(fn, i++ * 1500);

    for (const effect of effects) {
      switch (effect.type) {
        case 'TAX_PAID':
          schedule(() => {
            this.Game.players.find(p => p.Id === effect.toPlayerId)?.changeMoney(effect.amount);
            this.Game.CurrentPlayer.changeMoney(-effect.amount);
          });
          break;
        case 'CARD_DRAWN':
          schedule(() => {
            this.gameNotificationService.showCard(effect);
          });
          break;
        case 'STATIC_EVENT':
          schedule(() => this.onStaticEvent(effect));
          break;
        case 'PROPERTY_OFFERED':
          schedule(() => {
            this.Event$ = {
              type: GamePlayerEventType.Trading,
              eventData: {
                playerIndices: [effect.playerIndex],
                price: effect.price,
                propertyIndex: effect.propertyIndex,
                currentBidderIndex: null,
                passedPlayerIndices: [],
              },
            };
          });
          break;
        case 'PROPERTY_LOST':
          schedule(() => {
            if (effect.propertyIndex !== null) {
              const cell = this.Game.board.flatCells[effect.propertyIndex];
              if (PropertyCell.isInstancePropertyCell(cell)) {
                cell.object.owner = null;
                this.gameNotificationService.toast(`Lost property: ${cell.name}`);
              }
            } else {
              this.gameNotificationService.toast('No property to lose');
            }
          });
          break;
        case 'ITEM_RECEIVED':
          schedule(() => {
            this.Game.players[effect.playerIndex].giveItem(effect.item);
          });
          break;
        case 'BALANCE_CHANGED':
          schedule(() => {
            this.Game.players[effect.playerIndex].changeMoney(effect.amount);
          });
          break;
        case 'TURN_SKIPPED':
          schedule(() => {
            this.Game.players[effect.playerIndex].skipTurn();
            this.gameNotificationService.toast('Player will skip next turn');
          });
          break;
        case 'MONEY_TRANSFERRED_FROM_ALL':
          schedule(() => {
            const centerId = this.Game.players[effect.centerPlayerIndex].Id;
            for (const player of this.Game.players) {
              player.changeMoney(player.Id === centerId ?
                effect.amount * (effect.playerCount - 1) :
                -effect.amount);
            }
            if (this.isTurnActive) {
              this.gameNotificationService.toast(`Received ${effect.amount} from each player`);
            } else {
              this.gameNotificationService.toast(`Paid ${effect.amount} to current player`);
            }
          });
          break;
        // No-ops: handled elsewhere or not yet implemented on FE
        case 'PLAYER_MOVED':
        case 'PLAYER_MOVED_TO_POSITION':
        case 'PROPERTY_PURCHASED':
        case 'AUCTION_OPENED_TO_ALL':
        case 'AUCTION_PLAYER_PASSED':
        case 'AUCTION_FAILED':
        case 'AUCTION_BID_PLACED':
        case 'AUCTION_BID_INVALID':
        case 'INTERACTIVE_EVENT':
        case 'WAITING_FOR_MOVE_TO_CENTER':
        case 'MOVE_PLAYER_TODO':
          break;
      }
    }
  };

  private onGameOver = (data: Parameters<ServerToClientEvents['game_over']>[0]) => {
    if (data.winnerId === this.socket.id) {
      alert('You are the winner!');
    } else {
      alert(`Game over! ${data.winnerName} wins!`);
    }
  };

  private onPlayerEliminated = (data: Parameters<ServerToClientEvents['player_eliminated']>[0]) => {
    for (const { playerId, playerName } of data) {
      this.gameNotificationService.toast(`${playerName} has been eliminated!`);
      if (playerId === this.socket.id) {
        this.spectating$.next(true);
        alert('Game over! You have been eliminated.');
      }
    }
  };

  private onPropertyBought = (result: Parameters<ServerToClientEvents['property_bought']>[0]) => {
    if(result.success !== true) {
      throw new Error('Property purchase failed');
    }
    if(result.oldOwnerId) {
      this.Game.players.find(player => player.Id === result.oldOwnerId)?.changeMoney(result.price);
    }

    const propertyCell = this.Game.board.flatCells[result.propertyIndex] as PropertyCell;
    const buyer = this.Game.players.find(p => p.Id === result.newOwnerId);
    if (buyer) {
      buyer.changeMoney(-result.price);
    }
    propertyCell.object.owner = result.newOwnerId;
    this.propertyBought$.next(result);

    // Clear trading event after successful purchase
    this.Event$ = null;
  };

  private onStaticEvent = (staticEvent: Extract<GameEffect, { type: 'STATIC_EVENT' }>) => {
    switch(staticEvent.eventType) {
      case EventType.BalanceChange: {
        this.gameNotificationService.toast(`Balance changed by ${staticEvent.amount || 0}`);
        break;
      }
      case EventType.SkipTurn: {
        this.gameNotificationService.toast('Player will skip next turn');
        break;
      }
      case EventType.TaxService: {
        this.gameNotificationService.toast('Player moved to tax service');
        break;
      }
      default: throw new Error('Unknown static event type');
    }
  };

  private onTurnFinished = (result: Parameters<ServerToClientEvents['turn_finished']>[0]) => {
    this.game.getValue().nextTurn();
    this.turnFinished$.next(result);
  };

  private onTurnProgress = (result: Parameters<ServerToClientEvents['turn_progress']>[0]) => {
    if(result.success !== true) {
      throw new Error('Turn processing failed');
    }

    this.game.getValue().nextTurn(result.data.diceResult);
    this.diceRolled$.next(result);
    this.playerMoved$.next(true);
  };

  private onUserConnected = ({ id , name }: Parameters<ServerToClientEvents['user_connected']>[0]) => {
    console.log('user_connected', id, name);
    this.Game.updatePlayerIdByName(name, id);
    this.checkIfReady();
  };
  //#endregion
}
