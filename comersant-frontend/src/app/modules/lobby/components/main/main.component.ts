import { Component, OnInit } from '@angular/core';
import { LobbyService } from '../../services/lobby.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit {
  lobbyList: string[] = [];

  constructor(private readonly lobbyService: LobbyService) {}

  ngOnInit(): void {
    this.lobbyService.LobbyList.subscribe(list => {
      this.lobbyList = list;
    });
  }

  get userId() {
    return this.lobbyService.Id;
  }
}
