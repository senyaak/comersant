import { Component, ElementRef, ViewChild } from '@angular/core';
import { LobbyService } from 'src/app/modules/lobby/services/lobby.service';

@Component({
  selector: 'app-create-room',
  templateUrl: './create-room.component.html',
  styleUrls: ['./create-room.component.scss'],
})
export class CreateRoomComponent {
  @ViewChild('setNameDialog') dialog!: ElementRef<HTMLDialogElement>;
  name = '';
  constructor(private readonly lobbyService: LobbyService) {}

  createGame() {
    this.lobbyService.createRoom(this.name);
  }

  show() {
    this.dialog.nativeElement.showModal();
  }
  hide() {
    this.dialog.nativeElement.close();
  }
}
