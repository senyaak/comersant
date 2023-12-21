import { Component, Input } from '@angular/core';

@Component({
  selector: '[app-cell]',
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.scss'],
})
export class CellComponent {
  @Input() optionalClasses?: string[] = [];
}
