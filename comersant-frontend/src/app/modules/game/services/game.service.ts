import type { Game } from '$server/modules/game/models/type';
import { Routes } from '$server/types/routes';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Socket, io } from 'socket.io-client';

@Injectable()
export class GameService {
  private socket!: Socket;
  private game!: Game;

  constructor(private readonly http: HttpClient) {
    /** just placholder*/
    // this.socket = io('/game', { query: { gameId } });
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

    this.socket = this.socket = io('/game', { query: { gameId } });
    try {
      this.game = await this.loadGame(gameId);
      return this.game;
    } catch (e) {
      return Promise.reject();
    }
  }

  get Game() {
    return this.game;
  }
  async loadGame(gameId: string): Promise<Game> {
    return firstValueFrom(
      this.http.get<Game>(`${Routes.games}/${gameId}`),
    ).then(
      () => {
        console.log('game', this.game);
        return this.game;
      },
      e => {
        console.log('rej', e);
        return Promise.reject();
      },
    );
  }
}
