import { Injectable } from '@angular/core';
import { PaniereService } from './paniere.service';

@Injectable({
  providedIn: 'root',
})
export class PaniereFacade {
  number$ = this.paniereService.number$;
  remaining$ = this.paniereService.remaining$;
  extracted$ = this.paniereService.extracted$;
  gameStatus$ = this.paniereService.gameStatus$;

  constructor(private paniereService: PaniereService) {}

  loadGame() {
    this.paniereService.loadGame();
  }

  restart() {
    this.paniereService.reset();
  }

  pickNumber() {
    this.paniereService.pickNumber();
  }

  start() {
    return this.paniereService.start();
  }
}
