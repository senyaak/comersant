import { Component, OnInit } from '@angular/core';
import { LobbyService } from '../../../services/lobby.service';

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss'],
})
export class RoomsComponent implements OnInit {
  roomsList: string[] = [];

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
