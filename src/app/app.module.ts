import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppMaterialModule } from './app-material.module';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StartGameComponent } from './paniere/start-game/start-game.component';
import { PaniereComponent } from './paniere/paniere.component';
import { PlayGameComponent } from './paniere/play-game/play-game.component';
import { ShowBoardComponent } from './paniere/show-board/show-board.component';

@NgModule({
  declarations: [
    AppComponent,
    StartGameComponent,
    PaniereComponent,
    PlayGameComponent,
    ShowBoardComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, AppMaterialModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
