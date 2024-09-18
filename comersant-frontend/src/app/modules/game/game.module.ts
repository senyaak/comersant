import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { BoardComponent } from './components/main/board/board.component';
import { LandComponent } from './components/main/board/cell/base/land/land.component';
import { StartComponent } from './components/main/board/cell/base/start/start.component';
import { CellComponent } from './components/main/board/cell/cell.component';
import { MainComponent } from './components/main/main.component';
import { GameRoutingModule } from './game-routing.module';
import { GameService } from './services/game.service';

@NgModule({
  declarations: [
    MainComponent,
    BoardComponent,
    CellComponent,
    LandComponent,
    StartComponent,
  ],
  imports: [CommonModule, GameRoutingModule],
  providers: [GameService],
})
export class GameModule {}
