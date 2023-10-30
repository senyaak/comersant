import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client';

@Injectable()
export class GameService {
  private socket: Socket;

  constructor() {
    /** just placholder*/
    this.socket = io('/game', { query: {} });
  }

  init() {
    this.socket = io('/game', { query: {} });
  }
}
