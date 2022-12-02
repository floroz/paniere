import { Component } from '@angular/core';
import { of } from 'rxjs';

@Component({
  selector: 'app-play-game',
  templateUrl: './play-game.component.html',
  styleUrls: ['./play-game.component.scss'],
})
export class PlayGameComponent {
  number$ = of(5);
}
