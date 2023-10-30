import { Component, OnInit } from '@angular/core';
import { LobbyService } from '../../../services/lobby.service';
import { Room } from '$server/modules/lobby/types';

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss'],
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
