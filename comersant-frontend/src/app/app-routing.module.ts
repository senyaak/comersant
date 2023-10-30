import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'lobby',
    pathMatch: 'full',
  },
  {
    path: 'lobby',
    loadChildren: () =>
      import('./modules/lobby/lobby.module').then(m => m.LobbyModule),
  },
  {
    path: 'game',
    loadChildren: () =>
      import('./modules/game/game.module').then(m => m.GameModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
