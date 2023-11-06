import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GameRoutingModule } from './game-routing.module';
import { MainComponent } from './components/main/main.component';
import { GameService } from './services/game.service';
import { BoardComponent } from './components/main/board/board.component';
import { CellComponent } from './components/main/board/cell/cell.component';

@NgModule({
  declarations: [MainComponent, BoardComponent, CellComponent],
  imports: [CommonModule, GameRoutingModule],
  providers: [GameService],
})
export class GameModule {}
