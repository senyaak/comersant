import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { BoardComponent } from './components/main/board/board.component';
import { AreaComponent } from './components/main/board/cell/area/area.component';
import { CardComponent } from './components/main/board/cell/card/card.component';
import { IncomeComponent } from './components/main/board/cell/income/income.component';
import { PropertyComponent } from './components/main/board/cell/property/property.component';
import { EnterCenterComponent } from './components/main/board/cell/static/enter-center/enter-center.component';
import { MoveToCenterComponent } from './components/main/board/cell/static/move-to-center/move-to-center.component';
import { RacittoComponent } from './components/main/board/cell/static/racitto/racitto.component';
import { SkipTurnComponent } from './components/main/board/cell/static/skip-turn/skip-turn.component';
import { StartComponent } from './components/main/board/cell/static/start/start.component';
import { TaxServiceComponent } from './components/main/board/cell/static/tax-service/tax-service.component';
import { TaxComponent } from './components/main/board/cell/tax/tax.component';
import { CellWrapperComponent } from './components/main/board/cell/wrapper.component';
import { PawnComponent } from './components/main/board/player-ui/pawn/pawn.component';
import { PlayerUIComponent } from './components/main/board/player-ui/player-ui.component';
import { MainComponent } from './components/main/main.component';
import { BuyPropertyComponent } from './components/main/UI/game-control/buy-property/buy-property.component';
import { ControlActionsComponent } from './components/main/UI/game-control/control-actions/control-actions.component';
// TODO: remove abstrect
import { GameControlComponent } from './components/main/UI/game-control/game-control.component';
import { TurnControlComponent } from './components/main/UI/game-control/turn-control/turn-control.component';
import { GameInfoComponent } from './components/main/UI/game-info/game-info.component';
import { PlayerInfoComponent } from './components/main/UI/game-info/player-info/player-info.component';
import { PlayerPropertyComponent } from './components/main/UI/player-property/player-property.component';
import { GameRoutingModule } from './game-routing.module';
import { SplitLetters } from './pipes/singleLetterLine';
import { Split } from './pipes/singleWordLine';
import { GameEventsService } from './services/game-events.service';
import { GameNotificationService } from './services/game-notification.service';
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
    GameInfoComponent,
    PlayerInfoComponent,
    TurnControlComponent,
    GameControlComponent,
    PawnComponent,
    PlayerUIComponent,
    BuyPropertyComponent,
    PlayerPropertyComponent,
    ControlActionsComponent,
    TaxServiceComponent,
  ],
  imports: [CommonModule, GameRoutingModule, TranslateModule],
  providers: [GameService, GameStateService, GameEventsService, GameNotificationService],
})
export class GameModule {}
