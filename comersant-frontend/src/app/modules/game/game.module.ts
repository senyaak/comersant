import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
import { BoardComponent } from './components/main/board/board.component';
// TODO: remove abstrect
import { CardComponent } from './components/main/board/cell/card/card.component';
import { IncomeComponent } from './components/main/board/cell/income/income.component';
import { PropertyComponent } from './components/main/board/cell/property/property.component';
import { StartComponent } from './components/main/board/cell/start/start.component';
import { TaxComponent } from './components/main/board/cell/tax/tax.component';
import { CellWrapperComponent } from './components/main/board/cell/wrapper.component';
import { MainComponent } from './components/main/main.component';
import { GameRoutingModule } from './game-routing.module';
import { GameService } from './services/game.service';
import { AreaComponent } from './components/main/board/cell/area/area.component';

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
  ],
  imports: [CommonModule, GameRoutingModule, TranslateModule],
  providers: [GameService],
})
export class GameModule {}
