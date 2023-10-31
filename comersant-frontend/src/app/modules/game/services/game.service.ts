import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import type { Game } from '$server/modules/game/models/game';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class GameService {
  private socket!: Socket;
  private game!: Game;

  constructor(private readonly http: HttpClient) {
    /** just placholder*/
    // this.socket = io('/game', { query: { gameId } });
  }

  async init(gameId?: string) {
    // how do I fix typescript error here?
    const id = localStorage.getItem('gameId');
    if (!gameId && id) {
      gameId = id;
    } else if (gameId) {
      localStorage.setItem('gameId', gameId);
    } else {
      console.log('------', this.game);
      throw new Error('gameId is not provided');
    }

    this.socket = this.socket = io('/game', { query: { gameId } });
    this.game = await this.loadGame();
    console.log('------', this.game);
  }

  get Game() {
    return this.game;
  }
  loadGame(): Promise<Game> {
    return lastValueFrom(this.http.get<Game>('/game'));
  }
}
