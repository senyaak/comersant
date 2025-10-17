import type { IRawGame } from '$server/modules/game/models/GameModels/types';
import type { NextTurnResult } from '$server/modules/game/models/types';
import type { Observable } from 'rxjs';
import type { Socket } from 'socket.io-client';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  Router,
} from '@angular/router';
import { IGame } from '$server/modules/game/models/GameModels/igame';
import { Routes } from '$server/types/routes';
import { BehaviorSubject, tap } from 'rxjs';
import { io } from 'socket.io-client';
import { UserSettingsService } from 'src/app/services/user-settings.service';
/**
 * init and stores game data
 * */
@Injectable({
  providedIn: 'root',
})
export class GameService {
  private socket!: Socket;
  private game: BehaviorSubject<IGame> = new BehaviorSubject<IGame>(new IGame());

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly userSettingsService: UserSettingsService,
  ) {
  }

  get Game() {
    return this.game.getValue();
  }

  get Player() {
    // FIXIME: handle undefined player
    if(!this.socket) {
      throw new Error('Socket is not initialized');
    }
    return this.Game.players.find(player => player.Id === this.socket.id)!;
  }

  get Socket(): Promise<Socket> {
    if(!this.socket) {
      return new Promise((resolve) => {
        const interval = setInterval(() => {
          if(this.socket) {
            clearInterval(interval);
            resolve(this.socket);
          }
        }, 100);
      });
    }
    return Promise.resolve(this.socket);
  }

  init(gameId: string | null = null) {
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
      console.log('Game initialized:', this.game.getValue());
    });
  }

  private loadGame(gameId: string): Observable<IRawGame> {
    const game$ = this.http.get<IRawGame>(`${Routes.games}/${gameId}`).pipe(
      tap({ next: game => {
        this.game.next(new IGame(game));
        // this.game.complete();
        console.log('->Game loaded:', this.game.getValue());
      }, error: (err) => {
        console.error('Error loading game:', err);
        this.router.navigate(['/']);
      }}),
    );
    return game$;
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
      console.log('resttt', rest);
    });
    this.socket.on('turn_progress', (result: NextTurnResult) => {
      this.game.getValue().forceNextTurn();
      console.log('turn_progress', result);
      // Handle game updates
    });
  }

  public nextTurn(): void {
    this.socket.emit('nextTurn', (playerNumber: number) => {
      console.log('nextTurn done: curr playerNumber', playerNumber);
    });
  }
}
