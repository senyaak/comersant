import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserSettingsService {
  private playerNameKey = localStorage.getItem('user-name');
  constructor() { }

  set PlayerName(name: string) {
    this.playerNameKey = name;
    localStorage.setItem('user-name', name);
  }

  get PlayerName(): string | null {
    return this.playerNameKey;
  }

  // clearPlayerName() {
  //   localStorage.removeItem('playerName');
  // }
}
