import { Injectable } from '@angular/core';
import { io, type Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class LobbyService {
  private socket: Socket;
  constructor() {
    // TODO: CONFIG!!!
    // this.socket = io('ws://localhost:3000/lobby');
    this.socket = io('/lobby');
    this.socket.connect();
    this.socket.emit('events', 'world');
    console.log(this.socket.emit);
  }
}
