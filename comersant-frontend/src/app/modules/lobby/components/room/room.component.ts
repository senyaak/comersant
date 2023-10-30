import { Component, OnDestroy, OnInit } from '@angular/core';
import { LobbyService } from '../../services/lobby.service';
import { Router } from '@angular/router';
import { Room } from '$server/modules/lobby/types';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss'],
})
export class RoomComponent implements OnInit, OnDestroy {
  roomName = '';
  users: Room['users'] = [];
  constructor(
    private readonly lobbyService: LobbyService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    if (!this.lobbyService.RoomName) {
      this.router.navigate(['../']);
    }
    this.lobbyService.getRoomUsers().subscribe(room => {
      this.roomName = room.id;
      this.users = room.users;
    });
    this.lobbyService.SelectedRoom.subscribe(room => {
      this.users = room.users;
    });
  }

  ngOnDestroy() {
    this.lobbyService.leaveRoom();
  }
  leaveRoom() {
    this.router.navigate(['/']);
  }
  get userId() {
    return this.lobbyService.Id;
  }
  get isGameOwner() {
    return this.users.find(user => user.owner)?.id === this.userId;
  }
  startGame() {
    this.lobbyService.startGame();
  }
}
