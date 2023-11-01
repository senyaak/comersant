import type { Game } from '$server/modules/game/models/type';
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
      console.log('------', this.game);
      throw new Error('gameId is not provided');
    }

    this.socket = this.socket = io('/game', { query: { gameId } });
    this.game = await this.loadGame(gameId);
    console.log('------', this.game);
  }

  get Game() {
    return this.game;
  }
  loadGame(gameId: string): Promise<Game> {
    console.log('loadGame');
    this.http.get<Game>(`/api/games/${gameId}`).subscribe(
      game => {
        console.log('game', game);
      },
      e => {
        console.log('error', e);
      },
    );
    return null as any;
    // return firstValueFrom(this.http.get<Game>(`/api/game/${gameId}`));
  }
}
