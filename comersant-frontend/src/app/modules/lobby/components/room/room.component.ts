import { Component, OnInit } from '@angular/core';
import { LobbyService } from '../../services/lobby.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss'],
})
export class RoomComponent implements OnInit {
  constructor(
    private readonly lobbyService: LobbyService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    if (!this.lobbyService.RoomName) {
      this.router.navigate(['../']);
    }
  }
}
