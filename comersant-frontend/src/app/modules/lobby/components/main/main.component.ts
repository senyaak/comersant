import { Component, OnInit } from '@angular/core';

import { LobbyService } from '../../services/lobby.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  standalone: false,
})
export class MainComponent implements OnInit {
  constructor(private readonly lobbyService: LobbyService) {}

  ngOnInit() {
    this.lobbyService.join();
  }
}
