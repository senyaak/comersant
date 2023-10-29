import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { io, type Socket } from 'socket.io-client';
import { ClientEvents, ServerEvents } from '$server/modules/lobby/types';

import { UserIdentity } from '$server/modules/lobby/types';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class LobbyService {
  private socket: Socket;
  private name = '';
  private roomName: string | null = null;
  private lobbySubject = new Subject<UserIdentity[]>();
  private roomsSubject = new Subject<string[]>();

  constructor(
    private readonly router: Router,
    private readonly http: HttpClient,
  ) {
    /** setup connection to the lobby module */
    this.socket = io('/lobby');
    this.name = this.socket.id;
    /** subscribe to lobby events */
    this.socket.on(ServerEvents.UpdateConnectedUsers, this.updatePlayersList);
    this.socket.on(ServerEvents.RoomsUpdated, this.updatePlayersList);
    this.socket.on(ServerEvents.JoinedRoom, this.joinRoom);
    this.socket.on(ServerEvents.UpdateRoomsList, this.updateRoomsList);
    /** connect socket */
    this.socket.connect();
  }

  join = () => {
    this.socket.emit(ClientEvents.Join);
  };

  updatePlayersList = (list: UserIdentity[]) => {
    this.lobbySubject.next(list);
  };

  updateRoomsList = (list: string[]) => {
    this.roomsSubject.next(list);
  };

  joinRoom = (roomName: string) => {
    this.router.navigate([`/lobby/${roomName}`]);
  };
  get LobbyList(): Observable<UserIdentity[]> {
    return this.lobbySubject.asObservable();
  }
  get RoomsList() {
    return this.roomsSubject.asObservable();
  }

  get Id() {
    return this.socket.id;
  }
  get Name() {
    return this.name;
  }

  get RoomName() {
    return this.roomName;
  }
  setName(name: string) {
    this.socket.emit(ClientEvents.SetName, name);
    this.name = name;
  }
  createRoom(roomName: string) {
    this.roomName = roomName;
    this.socket.emit(ClientEvents.CreateRoom, roomName);
  }

  getRooms() {
    return this.http.get<string[]>('/rooms');
  }
}
