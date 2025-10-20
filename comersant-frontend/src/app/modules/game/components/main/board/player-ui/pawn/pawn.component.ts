import { AfterViewInit, Component, DoCheck, ElementRef, Input, ViewChild } from '@angular/core';
import { Player } from '$server/modules/game/models/GameModels/player';
import { GameService } from 'src/app/modules/game/services/game.service';

import { CellOffset, CellWidth } from '../../cell/abstract/base';

@Component({
  selector: '[app-pawn]',
  standalone: false,
  templateUrl: './pawn.component.html',
  styleUrl: './pawn.component.scss',
})
export class PawnComponent implements AfterViewInit, DoCheck {
  @ViewChild('cxAnim', { static: true }) cxAnim!: ElementRef<SVGAnimateElement>;
  lastCx = 0;
  @Input({required: true }) player!: Player;

  constructor(private gameService: GameService) {}

  ngAfterViewInit() {
    this.lastCx = this.cx;
  }

  ngDoCheck() {
    const next = this.cx;
    if (next !== this.lastCx) {
      const anim = this.cxAnim.nativeElement;
      anim.setAttribute('from', this.lastCx.toString());
      anim.setAttribute('to', next.toString());
      anim.beginElement();
      this.lastCx = next;
    }
  }

  get cx(): number {
    return this.PlayerPosition * (CellWidth + CellOffset) + 40;
  }

  get cy(): number {
    const pIndex = this.gameService.Game.players.findIndex(p => p.Id === this.player.Id);
    return 50 + pIndex * 20;
  }

  get Player(): Player {
    return this.player;
  }

  get PlayerColor(): string {
    return this.player.Color;
  }

  get PlayerPosition(): number {
    return this.player.Position;
  }

  get Radius(): number {
    return 15;
  }
}
