import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { BoardComponent } from './components/main/board/board.component';
// TODO: remove abstrect
import { AreaComponent } from './components/main/board/cell/area/area.component';
import { CardComponent } from './components/main/board/cell/card/card.component';
import { IncomeComponent } from './components/main/board/cell/income/income.component';
import { PropertyComponent } from './components/main/board/cell/property/property.component';
import { EnterCenterComponent } from './components/main/board/cell/static/enter-center/enter-center.component';
import { MoveToCenterComponent } from './components/main/board/cell/static/move-to-center/move-to-center.component';
import { RacittoComponent } from './components/main/board/cell/static/racitto/racitto.component';
import { SkipTurnComponent } from './components/main/board/cell/static/skip-turn/skip-turn.component';
import { StartComponent } from './components/main/board/cell/static/start/start.component';
import { TaxComponent } from './components/main/board/cell/tax/tax.component';
import { CellWrapperComponent } from './components/main/board/cell/wrapper.component';
import { MainComponent } from './components/main/main.component';
import { GameRoutingModule } from './game-routing.module';
import { SplitLetters } from './pipes/singleLetterLine';
import { Split } from './pipes/singleWordLine';
import { GameLoopService } from './services/game-loop.service';
import { GameStateService } from './services/game-state.service';
import { GameService } from './services/game.service';

@NgModule({
  declarations: [
    MainComponent,
    BoardComponent,
    CellWrapperComponent,
    StartComponent,
    PropertyComponent,
    CardComponent,
    IncomeComponent,
    TaxComponent,
    AreaComponent,
    MoveToCenterComponent,
    Split,
    SplitLetters,
    RacittoComponent,
    SkipTurnComponent,
    EnterCenterComponent,
  ],
  imports: [CommonModule, GameRoutingModule, TranslateModule],
  providers: [GameService, GameStateService, GameLoopService],
})
export class GameModule {}
