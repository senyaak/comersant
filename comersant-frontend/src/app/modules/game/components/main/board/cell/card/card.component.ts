import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {
  CardEventCell,
} from '$server/modules/game/models/FieldModels/cells';
import { CardPatterns, CardType } from 'src/app/modules/game/assets/svg/card-patterns';

import { BaseComponent } from '../abstract/base';

@Component({
  selector: '[app-card-cell]',
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  standalone: false,
})
export class CardComponent extends BaseComponent implements OnInit {
  @Input({ required: true }) cell!: CardEventCell;

  public color: string = 'black';
  public label: string = 'EVENT';

  public positionY: number = this.offset + this.height * 0.75;

  constructor(private sanitizer: DomSanitizer) {
    super();
  }

  ngOnInit() {
    if (this.cell instanceof CardEventCell) {
      // console.log('-> ', this, this.cell.name, this.cell.type);
      this.label = this.cell.type;
    } else {
      console.log(this.cell);
      throw new Error('HANDLE OTHER EVENT ');
    }
  }

  get cardCenterX(): number {
    const scaledWidth = CardPatterns.PATTERN_WIDTH * this.patternScale;
    return this.x + this.width / 2 - scaledWidth / 2;
  }

  get cardPattern(): SafeHtml {
    const pattern = CardPatterns.getPattern(this.cell.type as CardType);
    return this.sanitizer.bypassSecurityTrustHtml(pattern);
  }

  get patternScale(): number {
    return 0.7;
  }
}
