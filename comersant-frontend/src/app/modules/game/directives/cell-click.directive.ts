import { Directive, HostListener, Input } from '@angular/core';

import { BoardService } from '../services/board.service';

@Directive({
  selector: '[appCellClick]',
  standalone: false,
})
export class CellClickDirective {
  @Input({ required: true }) cellIndex!: number;

  constructor(
    private boardService: BoardService,
  ) {}

  @HostListener('click')
  onClick(): void {
    this.boardService.onCellClick(this.cellIndex);
    console.log('Cell clicked:', this.cellIndex);
  }
}
