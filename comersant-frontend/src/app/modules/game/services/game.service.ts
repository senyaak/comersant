import type { IRawGame } from '$server/modules/game/models/GameModels/types';
import type { NextTurnResult, PropertyBoughtResult } from '$server/modules/game/models/types';
import type { ClientToServerEvents, ServerToClientEvents } from '$server/modules/game/services/events/types';
import type { Observable } from 'rxjs';
import type { Socket } from 'socket.io-client';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  Router,
} from '@angular/router';
import { PropertyCell } from '$server/modules/game/models/FieldModels/cells';
import { Player } from '$server/modules/game/models/GameModels/player';
import { Routes } from '$server/types/routes';
import { BehaviorSubject, tap } from 'rxjs';
import { io } from 'socket.io-client';
import { UserSettingsService } from 'src/app/services/user-settings.service';

import { ICGame } from '../model/ICGame';
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
  public turnProgress$ = new BehaviorSubject<NextTurnResult>({ message: 'Game not found', success: false });

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly userSettingsService: UserSettingsService,
    private readonly gameStateService: GameStateService,
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
    return this.Game.players.find(player => player.Id === this.socket.id)!;
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

    this.socket.on('connect', (...rest) => {

      console.log('Connected with query params:', this.socket.io.opts.query);
      console.log('rest', rest);
    });

    this.socket.on('user_connected', ({ id , name }) => {
      console.log('user_connected', id,name);
      this.Game.updatePlayerIdByName(name, id);
      this.checkIfReady();
      // this.socket.id = newId;
    });

    this.socket.on('disconnect', () => {
      console.log('disconnected');
      this.socket.disconnect();
      this.router.navigate(['/']);
    });
    // this.socket.on('connect_error', () => {
    //   console.log('connect_error');
    //   this.router.navigate(['/']);
    // });
    // this.socket.on('message', () => {
    //   console.log('message');
    //   this.router.navigate(['/']);
    // });
    this.socket.onAny((...rest) => {
      console.log('@#socket on any', rest);
    });
    this.socket.on('turn_progress', (result: NextTurnResult) => {
      if(result.success !== true) {
        throw new Error('Turn processing failed');
      }

      this.game.getValue().nextTurn(result.data.turnResult);
      this.turnProgress$.next(result);
    });
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
}
