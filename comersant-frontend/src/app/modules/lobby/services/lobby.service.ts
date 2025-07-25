import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ClientEvents, Room, ServerEvents } from '$server/modules/lobby/types';
import { UserIdentity } from '$server/modules/lobby/types';
import { Routes } from '$server/types/routes';
import { Observable, Subject } from 'rxjs';
import { io, type Socket } from 'socket.io-client';
import { UserSettingsService } from 'src/app/services/user-settings.service';

@Injectable()
export class LobbyService {
  private socket: Socket;
  private roomName: string | null = null;
  public name = '';
  private lobbySubject = new Subject<UserIdentity[]>();
  private roomsSubject = new Subject<Room[]>();
  private selectedRoom = new Subject<Room>();

  constructor(
    private readonly router: Router,
    private readonly http: HttpClient,
    private readonly userSettingsService: UserSettingsService,
  ) {
    /** setup connection to the lobby module */
    this.socket = io('/lobby');
    if (!this.socket.id) {
      console.log('SOCKET ID NOW PROVIDED');
      // throw new Error('SOCKET ID NOW PROVIDED');
    }

    this.name = this.socket.id!;
    /** subscribe to lobby events */
    this.socket.on(ServerEvents.CreatedRoom, this.createdRoom);
    this.socket.on(ServerEvents.EnteredRoom, this.enteredRoom);
    this.socket.on(ServerEvents.RoomsUpdated, this.updatePlayersList);
    this.socket.on(ServerEvents.UpdateConnectedUsers, this.updatePlayersList);
    this.socket.on(ServerEvents.UpdateRoomsList, this.updateRoomsList);
    this.socket.on(ServerEvents.UpdateRoomUsers, this.updateSelectedRoom);
    this.socket.on(ServerEvents.RoomRemoved, this.roomRemoved);
    this.socket.on(ServerEvents.RoomIsFull, this.roomIsFull);
    this.socket.on(ServerEvents.StartGame, this.intoGame);
    this.socket.on(ServerEvents.Disconnect, this.disconnected);

    /** connect socket */
    this.socket.connect();
  }

  get LobbyList(): Observable<UserIdentity[]> {
    return this.lobbySubject.asObservable();
  }

  get RoomsList() {
    return this.roomsSubject.asObservable();
  }

  get SelectedRoom() {
    return this.selectedRoom.asObservable();
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

  join = () => {
    this.socket.emit(ClientEvents.Join);
  };

  updatePlayersList = (list: UserIdentity[]) => {
    this.lobbySubject.next(list);
  };

  createdRoom = (roomName: string) => {
    this.roomName = roomName;
    this.router.navigate(['lobby', roomName]);
  };

  updateRoomsList = (list: Room[]) => {
    this.roomsSubject.next(list);
  };

  updateSelectedRoom = (room: Room) => {
    this.selectedRoom.next(room);
  };

  enteredRoom = (roomName: string) => {
    this.roomName = roomName;
    this.router.navigate(['lobby', roomName]);
  };

  roomRemoved = () => {
    this.roomName = null;
    this.router.navigate(['/']);
  };

  intoGame = (id: string) => {
    this.socket.off(ServerEvents.Disconnect, this.disconnected);
    this.socket.disconnect();
    this.router.navigate(['/', 'game', id]);
  };

  roomIsFull = () => {
    alert('Room is full');
  };

  disconnected = async () => {
    await this.router.navigate(['/']);
    window.location.reload();
  };

  // event emitters
  setName(name: string) {
    this.socket.emit(ClientEvents.SetName, name);
    this.name = name;
    this.userSettingsService.PlayerName = name;
  }

  createRoom(roomName: string) {
    this.socket.emit(ClientEvents.CreateRoom, roomName);
  }

  enterRoom(name: string) {
    this.roomName = name;
    this.socket.emit(ClientEvents.EnterRoom, name);
  }

  leaveRoom() {
    this.socket.emit(ClientEvents.LeaveRoom);
    this.roomName = null;
  }

  startGame() {
    console.log('click');
    this.socket.emit(ClientEvents.StartGame);
  }

  // helpers
  getRooms() {
    return this.http.get<Room[]>(Routes.lobby);
  }

  getRoomUsers() {
    return this.http.get<Room>(`${Routes.lobby}/${this.roomName}`);
  }

  ngOnDestroy() {
    if(this.socket && this.socket.connected) {
      this.socket.disconnect();
    }
  }
}
