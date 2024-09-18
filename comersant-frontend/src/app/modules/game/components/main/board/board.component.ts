import { Board } from '$server/modules/game/models/FieldModels/board';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

// import { SVG } from '@svgdotjs/svg.js';
@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements AfterViewInit {
  @ViewChild('svgContainer') svgContainer!: ElementRef;
  board: Board = new Board();

  ngAfterViewInit() {
    console.log('test', this.svgContainer.nativeElement);
    console.log('2board', this.board.cells);
    // const draw = SVG()
    //   .addTo(this.svgContainer.nativeElement)
    //   .size('100%', '100%');
    // const rect = draw.rect(100, 100).attr({ fill: '#f06' });
    // rect.node.addEventListener('click', () => {
    //   // this.someAngularMethod();
    // });
  }
}
