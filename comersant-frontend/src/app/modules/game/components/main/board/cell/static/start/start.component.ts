import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../../abstract/base';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[app-start]',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss'],
})
export class StartComponent extends BaseComponent implements OnInit {
  polygonPoints: string = '';
  ngOnInit() {
    this.polygonPoints =
      `${this.x + this.width * 0.45}, ${this.height * 0.45}` +
      ' ' +
      `${this.x + this.width * 0.15}, ${this.height * 0.6}` +
      ' ' +
      `${this.x + this.width * 0.45}, ${this.height * 0.75}`;
  }
}
