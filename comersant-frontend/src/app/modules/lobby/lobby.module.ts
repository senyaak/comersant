import { CommonModule } from '@angular/common';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MainComponent } from './components/main/main.component';
import { CreateRoomComponent } from './components/main/rooms/create-room/create-room.component';
import { RoomsComponent } from './components/main/rooms/rooms.component';
import { SetNameComponent } from './components/main/users/set-name/set-name.component';
import { UsersComponent } from './components/main/users/users.component';
import { RoomComponent } from './components/room/room.component';
import { LobbyRoutingModule } from './lobby-routing.module';
import { LobbyService } from './services/lobby.service';

@NgModule({
  declarations: [
    MainComponent,
    RoomsComponent,
    UsersComponent,
    RoomComponent,
    SetNameComponent,
    CreateRoomComponent,
  ],
  imports: [CommonModule, LobbyRoutingModule, FormsModule],
  providers: [LobbyService, provideHttpClient(withInterceptorsFromDi())],
})
export class LobbyModule {}
