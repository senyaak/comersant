import { Component, OnInit } from '@angular/core';
import { LobbyService } from '../../../services/lobby.service';
import { UserIdentity } from '$server/modules/lobby/types';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  // providers: [LobbyService],
})
export class UsersComponent implements OnInit {
  lobbyList: UserIdentity[] = [];

  constructor(private readonly lobbyService: LobbyService) {}

  ngOnInit(): void {
    this.lobbyService.LobbyList.subscribe(list => {
      this.lobbyList = list ?? [];
    });
  }

  get userId() {
    return this.lobbyService.Id;
  }
}
