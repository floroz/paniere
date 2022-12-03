import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ResetGameDialogComponent } from './reset-game-dialog.component';
import { PaniereFacade } from '../services/paniere.facade';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-play-game',
  templateUrl: './play-game.component.html',
  styleUrls: ['./play-game.component.scss'],
})
export class PlayGameComponent {
  number$ = this.paniereFacade.number$;
  status$ = this.paniereFacade.gameStatus$;
  subscription = new Subscription();

  constructor(private paniereFacade: PaniereFacade, public dialog: MatDialog) {}

  ngOnInit() {
    this.paniereFacade.loadGame();
    this.subscription.add(this.paniereFacade.start().subscribe());
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onNext() {
    this.paniereFacade.pickNumber();
  }

  onRestart() {
    this.paniereFacade.restart();
  }

  onReset() {
    const ref = this.dialog.open(ResetGameDialogComponent);

    ref.afterClosed().subscribe((res) => res && this.onRestart());
  }
}
