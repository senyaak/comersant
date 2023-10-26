import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LobbyService } from './services/lobby.service';
import { MainComponent } from './components/main/main.component';
import { LobbyRoutingModule } from './lobby-routing.module';

@NgModule({
  declarations: [MainComponent],
  providers: [LobbyService],
  imports: [CommonModule, LobbyRoutingModule],
})
export class LobbyModule {}
