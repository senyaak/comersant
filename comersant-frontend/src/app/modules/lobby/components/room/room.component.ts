import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Room } from '$server/modules/lobby/types';

import { LobbyService } from '../../services/lobby.service';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss'],
  standalone: false,
})
export class RoomComponent implements OnInit, OnDestroy {
  roomName = '';
  users: Room['users'] = [];
  constructor(
    private readonly lobbyService: LobbyService,
    private readonly router: Router,
  ) {}

  ngOnDestroy() {
    this.lobbyService.leaveRoom();
  }

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

  leaveRoom() {
    this.router.navigate(['/']);
  }

  startGame() {
    this.lobbyService.startGame();
  }

  get isGameOwner() {
    return this.users.find(user => user.owner)?.id === this.userId;
  }

  get userId() {
    return this.lobbyService.Id;
  }
}
