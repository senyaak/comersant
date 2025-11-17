import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Room, ServerToClientEvents, ClientToServerEvents } from '$server/modules/lobby/types';
import { UserIdentity } from '$server/modules/lobby/types';
import { Routes } from '$server/types/routes';
import { Observable, Subject } from 'rxjs';
import { io, type Socket } from 'socket.io-client';
import { UserSettingsService } from 'src/app/services/user-settings.service';

@Injectable()
export class LobbyService {
  private lobbySubject = new Subject<UserIdentity[]>();
  private roomName: string | null = null;
  private roomsSubject = new Subject<Room[]>();
  private selectedRoom = new Subject<Room>();
  private socket: Socket<ServerToClientEvents, ClientToServerEvents>;

  createdRoom = (roomName: string) => {
    this.roomName = roomName;
    this.router.navigate(['lobby', roomName]);
  };

  disconnected = async () => {
    await this.router.navigate(['/']);
    window.location.reload();
  };

  enteredRoom = (roomName: string) => {
    this.roomName = roomName;
    this.router.navigate(['lobby', roomName]);
  };

  intoGame = (id: string) => {
    this.socket.off('disconnect', this.disconnected);
    this.socket.disconnect();
    this.router.navigate(['/', 'game', id]);
  };

  join = () => {
    this.socket.emit('join');
  };

  public name = '';

  roomIsFull = () => {
    alert('Room is full');
  };

  roomRemoved = () => {
    this.roomName = null;
    this.router.navigate(['/']);
  };

  updatePlayersList = (list: UserIdentity[]) => {
    this.lobbySubject.next(list);
  };

  updateRoomsList = (list: Room[]) => {
    this.roomsSubject.next(list);
  };

  updateSelectedRoom = (room: Room) => {
    this.selectedRoom.next(room);
  };

  constructor(
    private readonly router: Router,
    private readonly http: HttpClient,
    private readonly userSettingsService: UserSettingsService,
  ) {
    /** setup connection to the lobby module */
    this.socket = io('/lobby');

    /** subscribe to lobby events */
    this.socket.on('create-room', this.createdRoom);
    this.socket.on('enter-room', this.enteredRoom);
    this.socket.on('rooms-updated', this.updatePlayersList);
    this.socket.on('update-connected-users', this.updatePlayersList);
    this.socket.on('update-rooms-list', this.updateRoomsList);
    this.socket.on('update-room-users', this.updateSelectedRoom);
    this.socket.on('room-removed', this.roomRemoved);
    this.socket.on('room-is-full', this.roomIsFull);
    this.socket.on('start-game', this.intoGame);
    this.socket.on('disconnect', this.disconnected);
    this.socket.on('error', (message: string) => { alert(message); });
    /** connect socket */
    this.socket.connect();
  }

  ngOnDestroy() {
    if(this.socket && this.socket.connected) {
      this.socket.disconnect();
    }
  }

  get Id() {
    return this.socket.id;
  }

  get LobbyList(): Observable<UserIdentity[]> {
    return this.lobbySubject;
  }

  get Name() {
    return this.name;
  }

  get RoomName() {
    return this.roomName;
  }

  get RoomsList() {
    return this.roomsSubject;
  }

  get SelectedRoom() {
    return this.selectedRoom;
  }

  createRoom(roomName: string) {
    this.socket.emit('create-room', roomName);
  }

  enterRoom(name: string) {
    this.roomName = name;
    this.socket.emit('enter-room', name);
  }

  // helpers
  getRooms() {
    return this.http.get<Room[]>(Routes.lobby);
  }

  getRoomUsers() {
    return this.http.get<Room>(`${Routes.lobby}/${this.roomName}`);
  }

  leaveRoom() {
    this.socket.emit('leave-room');
    this.roomName = null;
  }

  // event emitters
  setName(name: string) {
    this.socket.emit('set-name', name);
    this.name = name;
    this.userSettingsService.PlayerName = name;
  }

  startGame() {
    console.log('click');
    this.socket.emit('start-game');
  }
}
