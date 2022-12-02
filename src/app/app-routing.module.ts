import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PaniereComponent } from './paniere/paniere.component';
import { PlayGameComponent } from './paniere/play-game/play-game.component';
import { ShowExtractedComponent } from './paniere/show-extracted/show-extracted.component';

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
        component: ShowExtractedComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: false })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
