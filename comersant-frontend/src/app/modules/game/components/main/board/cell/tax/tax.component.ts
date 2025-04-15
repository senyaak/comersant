import { Component, Input, OnInit } from '@angular/core';
import { BaseComponent } from '../abstract/base';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[app-tax-cell]',
  templateUrl: './tax.component.html',
  styleUrl: './tax.component.scss',
  standalone: false,
})
export class TaxComponent extends BaseComponent implements OnInit {
  @Input({ required: true }) tax!: number;

  get color() {
    return 'black';
  }
  ngOnInit(): void {
    console.log('init income');
  }
}
