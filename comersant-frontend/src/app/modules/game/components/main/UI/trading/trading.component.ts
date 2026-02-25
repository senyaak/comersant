import { Component, ElementRef, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { GamePlayerEventType } from '$server/modules/game/models/GameModels/gamePlayerEvent';
import { Subscription, interval } from 'rxjs';

import { GameEventsService } from '../../../../services/game-events.service';
import { GameService } from '../../../../services/game.service';

@Component({
  selector: 'app-trading',
  standalone: false,
  templateUrl: './trading.component.html',
  styleUrl: './trading.component.scss',
})
export class TradingComponent implements AfterViewInit, OnDestroy {
  private bidFailedSub?: Subscription;
  private subscription?: Subscription;
  private timerSubscription?: Subscription;
  public bidFailed = false;
  @ViewChild('tradingDialog') dialogRef?: ElementRef<HTMLDialogElement>;

  public timeRemaining?: number;

  constructor(
    private readonly gameService: GameService,
    private readonly gameEventsService: GameEventsService,
  ) {}

  ngAfterViewInit() {
    this.subscription = this.gameService.Event$.subscribe(state => {
      const dialog = this.dialogRef?.nativeElement;
      if (!dialog) {
        return;
      }

      if (state?.type === GamePlayerEventType.Trading) {
        dialog.showModal();
        this.startTimer();
      } else {
        // Close dialog if event is null or not Trading
        dialog.close();
        this.timerSubscription?.unsubscribe();
      }
    });
    // subscribe to bid failure notifications for local UI feedback
    this.bidFailedSub = this.gameService.bidFailed$.subscribe(flag => {
      this.bidFailed = flag;
      if (flag) {
        // clear after animation completes (handled by CSS)
        setTimeout(() => this.bidFailed = false, 1000);
      }
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
    this.timerSubscription?.unsubscribe();
    this.bidFailedSub?.unsubscribe();
  }

  get canBid(): boolean {
    if (!this.TradeEvent || !this.isAuction) return false;

    const playerIndex = this.gameService.Game.players.findIndex(
      p => p.Id === this.gameService.Player?.Id,
    );
    if (playerIndex === -1) return false;

    const player = this.gameService.Game.players[playerIndex];
    const { playerIndices, currentBidderIndex, price } = this.TradeEvent.eventData;

    // Check if player has enough money for minimum bid (+1k)
    const minNextBid = price + 1000;
    const hasEnoughMoney = player.Money >= minNextBid;

    // Cannot bid if:
    // - auction is locked
    // - player is not in participants list
    // - player is current bidder (must wait for others to bid)
    // - player doesn't have enough money
    return playerIndices.includes(playerIndex) &&
      currentBidderIndex !== playerIndex &&
      hasEnoughMoney;
  }

  get canUseFirstBuyOffer(): boolean {
    if (!this.isFirstBuyOffer || !this.TradeEvent) return false;

    // Check if current player is in the playerIndices list (first offer participant)
    const playerIndex = this.gameService.Game.players.findIndex(
      p => p.Id === this.gameService.Player?.Id,
    );
    if (playerIndex === -1) return false;

    return this.TradeEvent.eventData.playerIndices.includes(playerIndex);
  }

  get currentBidderName(): string | null {
    if (this.TradeEvent?.eventData.currentBidderIndex === null ||
        this.TradeEvent?.eventData.currentBidderIndex === undefined) return null;

    const bidderIndex = this.TradeEvent.eventData.currentBidderIndex;
    const bidder = this.gameService.Game.players[bidderIndex];
    const name = bidder?.Name ?? null;

    // Add (you) if it's the current player
    const currentPlayerIndex = this.gameService.Game.players.findIndex(
      p => p.Id === this.gameService.Player?.Id,
    );
    if (bidderIndex === currentPlayerIndex) {
      return name ? `${name} (you)` : '(you)';
    }

    return name;
  }

  get insufficientFunds(): boolean {
    if (!this.TradeEvent || !this.isAuction) return false;

    const playerIndex = this.gameService.Game.players.findIndex(
      p => p.Id === this.gameService.Player?.Id,
    );
    if (playerIndex === -1) return false;

    const player = this.gameService.Game.players[playerIndex];
    const { price, currentBidderIndex } = this.TradeEvent.eventData;

    // Show insufficient funds message if:
    // - player is not the current bidder
    // - auction is not locked
    // - player doesn't have enough money for minimum bid
    const minNextBid = price + 1000;
    return currentBidderIndex !== playerIndex &&
      player.Money < minNextBid;
  }

  get isAuction(): boolean {
    return (this.TradeEvent?.eventData.playerIndices.length ?? 0) > 1;
  }

  get isFirstBuyOffer(): boolean {
    return (this.TradeEvent?.eventData.playerIndices.length ?? 0) === 1;
  }

  get propertyName(): string {
    if (!this.TradeEvent) return '';

    const cell = this.gameService.Game.board.flatCells[this.TradeEvent.eventData.propertyIndex];
    return cell?.name ?? '';
  }

  get TradeEvent() {
    const event = this.gameService.Game.EventInProgress;
    if (!event || event.type !== GamePlayerEventType.Trading) {
      return null;
    }
    return event;
  }

  private startTimer() {
    this.timerSubscription?.unsubscribe();

    const trade = this.TradeEvent;
    if (!trade) return;

    // Initialize local countdown to 10 seconds for user's UX
    this.timeRemaining = 10;

    // Update timer every second and auto-pass when reaches 0
    this.timerSubscription = interval(1000).subscribe(() => {
      const currentTrade = this.TradeEvent;
      if (!currentTrade) {
        this.timerSubscription?.unsubscribe();
        return;
      }
      if (typeof this.timeRemaining !== 'number') {
        this.timeRemaining = 10;
      }
      this.timeRemaining -= 1;
      if (this.timeRemaining <= 0) {
        this.timerSubscription?.unsubscribe();
        // Auto-send pass (FE responsibility)
        this.pass();
      }
    });
  }

  buyProperty() {
    this.gameEventsService.buyProperty();
  }

  closeDialog() {
    // this.gameService.clearTradingState();
  }

  pass() {
    this.gameEventsService.refuseProperty();
  }

  placeBid(increment: number) {
    if (!this.TradeEvent) return;

    const newBid = this.TradeEvent.eventData.price + increment;
    this.gameEventsService.placeBid(newBid);
  }
}
