import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ResetGameDialogComponent } from './reset-game-dialog.component';
import { PaniereFacade } from '../services/paniere.facade';

@Component({
  selector: 'app-play-game',
  templateUrl: './play-game.component.html',
  styleUrls: ['./play-game.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayGameComponent {
  vm$ = this.paniereFacade.vm$;

  constructor(private paniereFacade: PaniereFacade, public dialog: MatDialog) {}

  onNext() {
    this.paniereFacade.pickNumber();
  }

  onRestart() {
    this.paniereFacade.restart();
  }

  onReset() {
    const dialogRef = this.dialog.open(ResetGameDialogComponent);

    dialogRef.afterClosed().subscribe((hasAccepted) => {
      if (hasAccepted) {
        this.onRestart();
      }
    });
  }
}
