import { Component, Input } from '@angular/core';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[app-cell]',
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.scss'],
})
export class CellComponent {
  // @Input() optionalClasses?: string[] = [];
  @Input({ required: true }) orderNumber!: number;
}
