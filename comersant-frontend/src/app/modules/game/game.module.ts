import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
import { BoardComponent } from './components/main/board/board.component';
// TODO: remove abstrect
import { PropertyComponent } from './components/main/board/cell/property/property.component';
import { StartComponent } from './components/main/board/cell/start/start.component';
import { CellWrapperComponent } from './components/main/board/cell/wrapper.component';
import { MainComponent } from './components/main/main.component';
import { GameRoutingModule } from './game-routing.module';
import { GameService } from './services/game.service';
import { CardComponent } from './components/main/board/cell/card/card.component';

@NgModule({
  declarations: [
    MainComponent,
    BoardComponent,
    CellWrapperComponent,
    StartComponent,
    PropertyComponent,
    CardComponent,
  ],
  imports: [CommonModule, GameRoutingModule, TranslateModule],
  providers: [GameService],
})
export class GameModule {}
