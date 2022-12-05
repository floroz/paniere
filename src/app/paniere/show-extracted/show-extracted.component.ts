import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PaniereFacade } from '../services/paniere.facade';

@Component({
  selector: 'app-show-extracted',
  templateUrl: './show-extracted.component.html',
  styleUrls: ['./show-extracted.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowExtractedComponent {
  constructor(private paniereFacade: PaniereFacade) {}
  vm$ = this.paniereFacade.vm$;
}
