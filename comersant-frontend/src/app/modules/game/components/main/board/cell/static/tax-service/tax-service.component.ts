import { Component } from '@angular/core';

import { BaseComponent } from '../../abstract/base';

@Component({
  selector: '[app-tax-service]',
  standalone: false,
  templateUrl: './tax-service.component.html',
  styleUrl: './tax-service.component.scss',
})
export class TaxServiceComponent extends BaseComponent {
  get words(): string[] {
    return $localize`:@@taxService:Tax Service`.split(' ');
  }
}
