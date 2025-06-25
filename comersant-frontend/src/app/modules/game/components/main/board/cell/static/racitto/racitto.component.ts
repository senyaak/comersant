import { Component } from '@angular/core';

import { BaseComponent } from '../../abstract/base';

@Component({
  selector: '[app-racitto]',
  templateUrl: './racitto.component.html',
  styleUrl: './racitto.component.scss',
  standalone: false,
})
export class RacittoComponent extends BaseComponent {}
