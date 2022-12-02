import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PaniereService } from '../services/paniere.service';

@Component({
  selector: 'app-show-extracted',
  templateUrl: './show-extracted.component.html',
  styleUrls: ['./show-extracted.component.scss'],
})
export class ShowExtractedComponent {
  constructor(private panService: PaniereService, private router: Router) {}

  ngOnInit() {
    if (!this.getExtracted().length) {
      this.router.navigate(['/']);
    }
  }

  getExtracted() {
    return this.panService.getExtracted();
  }
}
