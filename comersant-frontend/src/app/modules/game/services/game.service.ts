import type { IGame } from '$server/modules/game/models/type';
import { Routes } from '$server/types/routes';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Socket, io } from 'socket.io-client';

@Injectable()
export class GameService {
  private socket!: Socket;
  private game!: IGame;

  constructor(
    private readonly http: HttpClient,
    private router: Router,
  ) {
    /** just placholder*/
    // this.socket = io('/game', { query: { gameId } });
  }

  get Game() {
    return this.game;
  }

  async init(gameId: string | null = null) {
    const id = localStorage.getItem('gameId');
    if (!gameId && id) {
      gameId = id;
    } else if (gameId) {
      localStorage.setItem('gameId', gameId);
    } else {
      throw new Error('gameId is not provided');
    }

    this.socket = io('/game', { query: { gameId } });
    try {
      this.game = await this.loadGame(gameId);
      this.initSocket();
      return this.game;
    } catch (e) {
      return Promise.reject();
    }
  }

  async loadGame(gameId: string): Promise<IGame> {
    try {
      const game = await firstValueFrom(
        this.http.get<IGame>(`${Routes.games}/${gameId}`),
      );

      console.log('result', game);
      this.game = game;
      return this.game;
    } catch (e) {
      console.log('rej', e);

      return Promise.reject();
    }
  }

  initSocket() {
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
      console.log('rest', rest);
    });
  }
}
