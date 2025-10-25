import { Component, OnInit } from '@angular/core';
import { PropertyCell } from '$server/modules/game/models/FieldModels/cells';
import { Player } from '$server/modules/game/models/GameModels/player';
import { Turn } from '$server/modules/game/models/GameModels/turn';
import { GameService } from 'src/app/modules/game/services/game.service';

@Component({
  selector: 'app-game-control',
  standalone: false,
  templateUrl: './game-control.component.html',
  styleUrl: './game-control.component.scss',
})
export class GameControlComponent implements OnInit {
  constructor(
    private gameService: GameService,
  ) {}

  ngOnInit() {
  }

  get canBuyProperty(): boolean {
    // const canBuyCell = !!Board.cells.flat()[this.Player.Position];
    const cell = this.gameService.Game.board.flatCells[this.Player.Position];
    if(cell instanceof PropertyCell === false) {
      return false;
    }

    const hasMoney = cell.object.price < this.Player.Money;
    const canBuyCell = cell.object.owner === null;
    return this.TurnState === Turn.Event && this.isMyTurn && canBuyCell && hasMoney;
  }

  get currentPlayerName(): string {
    return this.gameService.Game.players[this.gameService.Game.CurrentPlayer]?.Name || 'No Current Player';
  }

  get isMyTurn(): boolean {
    return this.gameService.isTurnActive;
  }

  get Player(): Player {
    return this.gameService.Player;
  }

  get playerName(): string {
    return this.gameService.Player?.Name || 'Unknown Player';
  }

  get TurnState() {
    return this.gameService.Game.CurrentTurnState;
  }
}
