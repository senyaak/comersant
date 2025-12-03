import { Directive, ElementRef, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { Subscription } from 'rxjs';

import { GameService } from '../services/game.service';

/**
 * Directive that adds a frozen ice effect to an element when the game is paused.
 * Automatically subscribes to game pause state and applies/removes the effect.
 *
 * @example
 * <div app-frozen-when-paused>Content to freeze</div>
 */
@Directive({
  selector: '[app-frozen-when-paused]',
  standalone: false,
})
export class FrozenWhenPausedDirective implements OnInit, OnDestroy {
  private iceOverlay?: HTMLElement;
  private pausedSubscription?: Subscription;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private gameService: GameService,
  ) {}

  ngOnDestroy() {
    this.pausedSubscription?.unsubscribe();
    this.removeFrozenEffect();
  }

  ngOnInit() {
    // Make element position relative if not already positioned
    const position = window.getComputedStyle(this.el.nativeElement).position;
    if (position === 'static') {
      this.renderer.setStyle(this.el.nativeElement, 'position', 'relative');
    }

    // Subscribe to pause state
    this.pausedSubscription = this.gameService.Paused$.subscribe((paused) => {
      if (paused) {
        this.applyFrozenEffect();
      } else {
        this.removeFrozenEffect();
      }
    });
  }

  private applyFrozenEffect() {
    // Add frozen class to host element
    this.renderer.addClass(this.el.nativeElement, 'frozen');

    // Create ice overlay
    this.iceOverlay = this.renderer.createElement('div');
    this.renderer.addClass(this.iceOverlay, 'ice-overlay');

    // Create ice crystals
    for (let i = 1; i <= 3; i++) {
      const crystal = this.renderer.createElement('div');
      this.renderer.addClass(crystal, 'ice-crystal');
      this.renderer.addClass(crystal, `ice-crystal-${i}`);
      this.renderer.appendChild(this.iceOverlay, crystal);
    }

    // Create ice shine
    const shine = this.renderer.createElement('div');
    this.renderer.addClass(shine, 'ice-shine');
    this.renderer.appendChild(this.iceOverlay, shine);

    // Append overlay to host element
    this.renderer.appendChild(this.el.nativeElement, this.iceOverlay);
  }

  private removeFrozenEffect() {
    // Remove frozen class
    this.renderer.removeClass(this.el.nativeElement, 'frozen');

    // Remove ice overlay
    if (this.iceOverlay) {
      this.renderer.removeChild(this.el.nativeElement, this.iceOverlay);
      this.iceOverlay = undefined;
    }
  }
}
