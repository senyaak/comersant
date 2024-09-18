import { Component } from '@angular/core';
import { BaseComponent } from './abstract/base';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[app-cell-wrapper]',
  templateUrl: './wrapper.component.html',
  styleUrls: ['./wrapper.component.scss'],
})
export class CellWrapperComponent extends BaseComponent {}
