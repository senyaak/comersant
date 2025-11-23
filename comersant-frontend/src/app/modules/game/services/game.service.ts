import type { IRawGame } from '$server/modules/game/models/GameModels/types';
import type {
  RollTurnResult,
  PropertyBoughtResult,
  TurnFinishedResult,
  IEventResult,
} from '$server/modules/game/models/types';
import type { ClientToServerEvents, ServerToClientEvents } from '$server/modules/game/services/events/types';
import type { Observable } from 'rxjs';
import type { Socket } from 'socket.io-client';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  Router,
} from '@angular/router';
import { EventItem, EventType } from '$server/modules/game/models/events';
import { Board } from '$server/modules/game/models/FieldModels/board';
import { Cards } from '$server/modules/game/models/FieldModels/cards';
import { PropertyCell } from '$server/modules/game/models/FieldModels/cells';
import { ItemType } from '$server/modules/game/models/GameModels/items';
import { Player } from '$server/modules/game/models/GameModels/player';
import { Routes } from '$server/types/routes';
import { BehaviorSubject, tap } from 'rxjs';
import { io } from 'socket.io-client';
import { UserSettingsService } from 'src/app/services/user-settings.service';

import { ICGame } from '../model/ICGame';
import { GameNotificationService } from './game-notification.service';
import { GameStateService } from './game-state.service';
/**
 * init and stores game data
 * */
@Injectable({
  providedIn: 'root',
})
export class GameService {
  private game: BehaviorSubject<ICGame> = new BehaviorSubject<ICGame>(new ICGame());

  private socket!: Socket<ServerToClientEvents, ClientToServerEvents>;

  public gameReady$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public propertyBought$ = new BehaviorSubject<PropertyBoughtResult>({ success: false });

  public turnFinished$ = new BehaviorSubject<TurnFinishedResult>(
    { message: 'Unknown error finishing turn', success: false },
  );

  public turnProgress$ = new BehaviorSubject<RollTurnResult>({ message: 'Game not found', success: false });

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly userSettingsService: UserSettingsService,
    private readonly gameStateService: GameStateService,
    private readonly gameNotificationService: GameNotificationService,
  ) {
    this.game.subscribe(() => {
      this.checkIfReady();
    });
  }

  get Game() {
    return this.game.getValue();
  }

  get isTurnActive(): boolean {
    return this.Game.CurrentPlayer === this.Game.players.findIndex(
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
    this.socket.on('propertyBought', this.onPropertyBought);
    // this.socket.on('connect_error', this.onConnectError);
  }

  private loadGame(gameId: string): Observable<IRawGame> {
    const game$ = this.http.get<IRawGame>(`${Routes.games}/${gameId}`).pipe(
      tap({ next: game => {
        console.log('set game', game);
        this.game.next(new ICGame(game));
        // this.game.complete();
        // console.log('->Game loaded:', this.game.getValue());
      }, error: (err) => {
        console.error('Error loading game:', err);
        this.router.navigate(['/']);
      }}),
    );
    return game$;
  }

  public init(gameId: string | null = null) {
    console.log('init game service with gameId:', gameId);
    const id = localStorage.getItem('gameId');
    if (!gameId && id) {
      gameId = id;
    } else if (gameId) {
      localStorage.setItem('gameId', gameId);
    } else {
      throw new Error('gameId is not provided');
    }

    return this.loadGame(gameId).pipe(tap({next: (game) => {
      console.log('game', game);
      this.initSocket();
    }, error: (err) => {
      console.error('Error loading game:', err);
    }})).subscribe(() => {
      console.log('Game initialized:', this.Game);
    });
  }

  //#region Event Handlers
  private onAny = (...rest: unknown[]) => {
    console.log('@#socket on any', rest);
  };

  private onCardEvent = (card: Cards[keyof Cards]) => {
    switch(card.type) {
      case EventType.BalanceChange: {
        this.Game.players[this.Game.CurrentPlayer].changeMoney(card.amount);
        break;
      }
      case EventType.GetEvent: {
        this.onHandleGetEvent(card.item);
        break;
      }
      case EventType.MoneyTransfer: {break;}
      case EventType.Move: {break;}
      case EventType.MovePlayer: {break;}
      case EventType.MoveTo: {
        const newPostition = Board.getTargetPosition(card.to);
        const currentPosition = this.Game.players[this.Game.CurrentPlayer].Position;
        const steps = Math.abs(newPostition - currentPosition);
        this.Game.players[this.Game.CurrentPlayer].move(steps);
        this.gameNotificationService.toast(`Moved to ${card.to}`);
        break;
      }
      case EventType.MoveToCenter: {break;}
      case EventType.PropertyLoss: {break;}
      case EventType.SkipTurn: {break;}
      case EventType.TaxService: {break;}
    }
  };

  private onConnect = (...rest: unknown[]) => {
    console.log('Connected with query params:', this.socket.io.opts.query);
    console.log('rest', rest);
  };

  // private onConnectError = () => {
  //   console.log('connect_error');
  //   this.router.navigate(['/']);
  // };

  private onDisconnect = () => {
    console.log('disconnected');
    this.socket.disconnect();
    this.router.navigate(['/']);
  };

  private onEventResult = (results: Parameters<ServerToClientEvents['event_result']>[0]) => {
    console.log('Event results received:', results);
    const handler = (result: IEventResult) => {
      let i = 0;
      if(result.taxPaid) {
        const taxPaid = result.taxPaid;
        setTimeout(() => {
          this.Game.players.find(player => player.Id === taxPaid.toPlayerId)
            ?.changeMoney(taxPaid.amount);
          this.Game.players[this.Game.CurrentPlayer].changeMoney(-taxPaid.amount);
        }, i++ * 1500);
      }
      if(result.cardDrawn) {
        const cardDrawn = result.cardDrawn;
        setTimeout(() => {
          this.onCardEvent(cardDrawn.card);
          this.gameNotificationService.showCard(cardDrawn);
        }, i++ * 1500);
      }
      if(result.staticEvent) {
        const staticEvent = result.staticEvent;
        setTimeout(() => {
          this.onStaticEvent(staticEvent);
        }, i++ * 1500);
      }
      return i;
    };

    // use global index since a single handler call can have multiple events
    let i = 0;
    results.forEach((result) => {
      setTimeout(() => i += handler(result), i * 1500);
    });
  };

  private onHandleGetEvent = (item: EventItem) => {
    switch(item) {
      case EventItem.TaxFree: {
        this.Game.players[this.Game.CurrentPlayer].giveItem(ItemType.TaxFree);
        this.gameNotificationService.toast('Tax Free item received');
        break;
      }
      case EventItem.Security: {
        this.Game.players[this.Game.CurrentPlayer].giveItem(ItemType.Security);
        this.gameNotificationService.toast('Security item received');
        break;
      }
      case EventItem.Mail:
      case EventItem.Risk:
      case EventItem.Surprise:
        this.gameNotificationService.toast('Draw new card');
        break;
      default:
        throw new Error('Unknown event item type');
    }

  };

  private onPropertyBought = (result: Parameters<ServerToClientEvents['propertyBought']>[0]) => {
    if(result.success !== true) {
      throw new Error('Property purchase failed');
    }
    if(result.oldOwnerId) {
      this.Game.players.find(player => player.Id === result.oldOwnerId)?.changeMoney(result.price);
    }

    const propertyCell = this.Game.board.flatCells[result.propertyIndex] as PropertyCell;
    this.Game.players[this.Game.CurrentPlayer].changeMoney(-result.price);
    propertyCell.object.owner = result.newOwnerId;
    this.propertyBought$.next(result);
  };

  private onStaticEvent = (staticEvent: NonNullable<IEventResult['staticEvent']>) => {
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
    this.turnProgress$.next(result);
  };

  private onUserConnected = ({ id , name }: Parameters<ServerToClientEvents['user_connected']>[0]) => {
    console.log('user_connected', id, name);
    this.Game.updatePlayerIdByName(name, id);
    this.checkIfReady();
  };
  //#endregion
}
