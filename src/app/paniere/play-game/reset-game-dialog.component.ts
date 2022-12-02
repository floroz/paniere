import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: `app-reset-game-dialog`,
  template: `
    <div class="box">
      <h3>Are you sure you want to reset the game?</h3>
      <div class="btn-group">
        <button mat-raised-button color="warn" (click)="onAccept()">Yes</button>
        <button mat-raised-button color="secondary" (click)="onRefuse()">
          No
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .box {
        padding: 2rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }

      .btn-group button:first-child {
        margin-right: 1rem;
      }
    `,
  ],
})
export class ResetGameDialogComponent {
  constructor(public dialogRef: MatDialogRef<ResetGameDialogComponent>) {}

  onAccept() {
    this.dialogRef.close(true);
  }

  onRefuse() {
    this.dialogRef.close(false);
  }
}
