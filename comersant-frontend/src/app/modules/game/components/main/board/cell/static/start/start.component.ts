
import { Component } from '@angular/core';

import { BaseComponent } from '../../abstract/base';

@Component({
  selector: '[app-start]',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss'],
  standalone: false,
})
export class StartComponent extends BaseComponent {
  get polygonPoints() {
    const [a,b,c] = [
      `${this.localX + this.width * 0.45}, ${this.height * 0.45}`,
      `${this.localX + this.width * 0.15}, ${this.height * 0.6}`,
      `${this.localX + this.width * 0.45}, ${this.height * 0.75}`,
    ];
    return a + ' ' + b + ' ' + c;
  }
}
