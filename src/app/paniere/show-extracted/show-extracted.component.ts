import { Component } from '@angular/core';
import { PaniereFacade } from '../services/paniere.facade';

@Component({
  selector: 'app-show-extracted',
  templateUrl: './show-extracted.component.html',
  styleUrls: ['./show-extracted.component.scss'],
})
export class ShowExtractedComponent {
  constructor(private paniereFacade: PaniereFacade) {}
  extracted$ = this.paniereFacade.extracted$;

  // ngOnInit() {
  //   if (!this.getExtracted().length) {
  //     this.router.navigate(['/']);
  //   }
  // }
}
