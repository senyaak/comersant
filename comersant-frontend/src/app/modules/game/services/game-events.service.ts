import { Injectable } from '@angular/core';

import { GameStateService } from './game-state.service';
import { GameService } from './game.service';

@Injectable({
  providedIn: 'root',
})
export class GameEventsService {

  constructor(private gameService: GameService, private gameStateService: GameStateService) {
  }

  get Socket() {
    return this.gameService.Socket;
  }

  public buyProperty(): void {
    this.Socket.emit('buyProperty');
  }

  public nextTurn(): void {
    this.Socket.emit('nextTurn', {diceCounter: this.gameStateService.DiceCounter});
  }

  toast(msg: string) {
    const snackbar = document.createElement('div');
    snackbar.textContent = msg;
    snackbar.style.position = 'fixed';
    snackbar.style.bottom = '20px';
    snackbar.style.left = '50%';
    snackbar.style.transform = 'translateX(-50%)';
    snackbar.style.backgroundColor = '#323232';
    snackbar.style.color = '#fff';
    snackbar.style.padding = '10px 20px';
    snackbar.style.borderRadius = '4px';
    snackbar.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
    snackbar.style.zIndex = '1000';
    snackbar.style.fontSize = '14px';
    snackbar.style.opacity = '0';
    snackbar.style.transition = 'opacity 0.3s ease';

    document.body.appendChild(snackbar);

    // Show the snackbar
    setTimeout(() => {
      snackbar.style.opacity = '1';
    }, 10);

    // Remove the snackbar after 3 seconds
    setTimeout(() => {
      snackbar.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(snackbar);
      }, 300);
    }, 3000);
  }
}
