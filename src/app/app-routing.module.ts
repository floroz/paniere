import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PaniereComponent } from './paniere/paniere.component';
import { PlayGameComponent } from './paniere/play-game/play-game.component';
import { ShowBoardComponent } from './paniere/show-board/show-board.component';
import { StartGameComponent } from './paniere/start-game/start-game.component';

const routes: Routes = [
  {
    path: '',
    component: PaniereComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: StartGameComponent,
      },
      {
        path: 'play',
        pathMatch: 'full',
        component: PlayGameComponent,
      },
      {
        path: 'board',
        pathMatch: 'full',
        component: ShowBoardComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: false })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
