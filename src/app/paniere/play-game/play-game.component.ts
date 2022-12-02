import { Component } from '@angular/core';
import { PaniereService } from '../services/paniere.service';
import { MatDialog } from '@angular/material/dialog';
import { ResetGameDialogComponent } from './reset-game-dialog.component';

@Component({
  selector: 'app-play-game',
  templateUrl: './play-game.component.html',
  styleUrls: ['./play-game.component.scss'],
})
export class PlayGameComponent {
  number$ = this.panSer.number$;

  constructor(private panSer: PaniereService, public dialog: MatDialog) {}

  ngOnInit() {
    this.panSer.loadGame();
  }

  onNext() {
    this.panSer.nextNumber();
  }

  isPlaying() {
    return this.panSer.getExtracted().length < 9;
  }

  onRestart() {
    this.panSer.startGame();
  }

  onReset() {
    const ref = this.dialog.open(ResetGameDialogComponent);

    ref.afterClosed().subscribe((res) => res && this.onRestart());
  }
}
