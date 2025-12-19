import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { GamePlayerEventType } from '$server/modules/game/models/GameModels/gamePlayerEvent';
import { Subscription } from 'rxjs';

import { GameService } from '../../../../services/game.service';

@Component({
  selector: 'app-trading',
  standalone: false,
  templateUrl: './trading.component.html',
  styleUrl: './trading.component.scss',
})
export class TradingComponent implements OnInit, OnDestroy {
  private subscription?: Subscription;

  @ViewChild('tradingDialog') dialogRef?: ElementRef<HTMLDialogElement>;

  constructor(private readonly gameService: GameService) {}

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  ngOnInit() {
    this.subscription = this.gameService.Event$.subscribe(state => {
      if(state?.type !== GamePlayerEventType.Trading) {
        return;
      }

      const dialog = this.dialogRef?.nativeElement;
      if (!dialog) return;

      if (state !== null) {
        dialog.showModal();
      } else {
        dialog.close();
      }
    });
  }

  get TradeEvent() {
    const event = this.gameService.Game.EventInProgress;
    if (!event || event.type !== GamePlayerEventType.Trading) {
      return null;
    }
    return event;
  }

  closeDialog() {
    console.log('try to close dialog');
    // this.gameService.clearTradingState();
  }
}
