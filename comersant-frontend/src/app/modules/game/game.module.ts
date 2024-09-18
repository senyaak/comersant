import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
import { BoardComponent } from './components/main/board/board.component';
import { StartComponent } from './components/main/board/cell/base/start/start.component';
import { CellWrapperComponent } from './components/main/board/cell/wrapper.component';
import { MainComponent } from './components/main/main.component';
import { GameRoutingModule } from './game-routing.module';
import { GameService } from './services/game.service';

@NgModule({
  declarations: [
    MainComponent,
    BoardComponent,
    CellWrapperComponent,
    StartComponent,
  ],
  imports: [CommonModule, GameRoutingModule, TranslateModule],
  providers: [GameService],
})
export class GameModule {}
