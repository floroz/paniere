import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppMaterialModule } from './app-material.module';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StartGameComponent } from './paniere/start-game/start-game.component';
import { PaniereComponent } from './paniere/paniere.component';
import { PlayGameComponent } from './paniere/play-game/play-game.component';
import { ShowExtractedComponent } from './paniere/show-extracted/show-extracted.component';
import { ResetGameDialogComponent } from './paniere/play-game/reset-game-dialog.component';
import { ServiceWorkerModule } from '@angular/service-worker';

@NgModule({
  declarations: [
    AppComponent,
    StartGameComponent,
    PaniereComponent,
    PlayGameComponent,
    ShowExtractedComponent,
    ResetGameDialogComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, AppMaterialModule, ServiceWorkerModule.register('ngsw-worker.js', {
  enabled: !isDevMode(),
  // Register the ServiceWorker as soon as the application is stable
  // or after 30 seconds (whichever comes first).
  registrationStrategy: 'registerWhenStable:30000'
})],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
