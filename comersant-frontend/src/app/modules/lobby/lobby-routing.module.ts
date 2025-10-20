import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MainComponent } from './components/main/main.component';
import { RoomComponent } from './components/room/room.component';

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
  },
  {
    path: ':room',
    component: RoomComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LobbyRoutingModule {}
