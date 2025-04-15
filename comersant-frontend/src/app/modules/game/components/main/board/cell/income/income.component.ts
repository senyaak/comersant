import { Component, Input, OnInit } from '@angular/core';
import { BaseComponent } from '../abstract/base';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[app-income-cell]',
  templateUrl: './income.component.html',
  styleUrl: './income.component.scss',
  standalone: false,
})
export class IncomeComponent extends BaseComponent implements OnInit {
  @Input({ required: true }) income!: number;

  get color() {
    return 'red';
  }
  ngOnInit(): void {
    console.log('init income');
  }
}
