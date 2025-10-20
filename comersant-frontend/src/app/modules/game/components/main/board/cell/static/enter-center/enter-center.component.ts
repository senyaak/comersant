import { Component } from '@angular/core';

import { BaseComponent } from '../../abstract/base';

@Component({
  selector: '[app-enter-center]',
  standalone: false,
  templateUrl: './enter-center.component.html',
  styleUrl: './enter-center.component.scss',
})
export class EnterCenterComponent extends BaseComponent {
  get lettersHeight(): string {
    return '0.8em';
  }

  get splitterX(): number {
    return this.x + this.width / 2;
  }
}
