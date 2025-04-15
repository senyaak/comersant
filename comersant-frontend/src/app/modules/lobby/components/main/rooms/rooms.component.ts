import { Component, OnInit } from '@angular/core';
import { Room } from '$server/modules/lobby/types';

import { LobbyService } from '../../../services/lobby.service';

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss'],
  standalone: false,
})
export class RoomsComponent implements OnInit {
  roomsList: Room[] = [];

  constructor(private readonly lobbyService: LobbyService) {}

  ngOnInit(): void {
    this.lobbyService.getRooms().subscribe(list => {
      this.roomsList = list;
    });
    this.lobbyService.RoomsList.subscribe(list => {
      this.roomsList = list;
    });
  }

  enterRoom(roomName: string) {
    this.lobbyService.enterRoom(roomName);
  }
}
