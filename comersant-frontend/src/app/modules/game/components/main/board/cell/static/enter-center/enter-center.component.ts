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

  get secondCircleLetters(): string[] {
    return $localize`:@@second-circle:2nd Circle`.split('');
  }

  get splitterX(): number {
    return this.localX + this.width / 2;
  }

  get toStartLetters(): string[] {
    return $localize`:@@to-start:To Start`.split('');
  }
}
