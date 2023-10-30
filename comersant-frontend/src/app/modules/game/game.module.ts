import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GameRoutingModule } from './game-routing.module';
import { MainComponent } from './components/main/main.component';
import { GameService } from './services/game.service';

@NgModule({
  declarations: [MainComponent],
  imports: [CommonModule, GameRoutingModule],
  providers: [GameService],
})
export class GameModule {}
