import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { io, type Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class LobbyService {
  private socket: Socket;
  private lobbySubject = new Subject<string[]>();

  constructor() {
    /** setup lobby connection */
    this.socket = io('/lobby');
    /** subscribe to lobby events */
    this.socket.on('players_list', this.updatePlayersList);
    /** connect socket */
    this.socket.connect();
  }

  updatePlayersList = (list: string[]) => {
    this.lobbySubject.next(list);
  };

  get LobbyList() {
    return this.lobbySubject.asObservable();
  }

  get Id() {
    return this.socket.id;
  }
}
