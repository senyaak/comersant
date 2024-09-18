import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LobbyService } from './services/lobby.service';
import { MainComponent } from './components/main/main.component';
import { LobbyRoutingModule } from './lobby-routing.module';
import { RoomsComponent } from './components/main/rooms/rooms.component';
import { UsersComponent } from './components/main/users/users.component';
import { RoomComponent } from './components/room/room.component';
import { SetNameComponent } from './components/main/users/set-name/set-name.component';
import { FormsModule } from '@angular/forms';
import { CreateRoomComponent } from './components/main/rooms/create-room/create-room.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

@NgModule({ declarations: [
        MainComponent,
        RoomsComponent,
        UsersComponent,
        RoomComponent,
        SetNameComponent,
        CreateRoomComponent,
    ], imports: [CommonModule, LobbyRoutingModule, FormsModule], providers: [LobbyService, provideHttpClient(withInterceptorsFromDi())] })
export class LobbyModule {}
