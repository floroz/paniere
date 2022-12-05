import { Injectable } from '@angular/core';
import { PaniereService } from './paniere.service';

@Injectable({
  providedIn: 'root',
})
export class PaniereFacade {
  vm$ = this.paniereService.vm$;

  constructor(private paniereService: PaniereService) {
    this.paniereService.loadGame();
    this.paniereService.start().subscribe();
  }

  restart() {
    this.paniereService.reset();
  }

  pickNumber() {
    this.paniereService.pickNumber();
  }
}
