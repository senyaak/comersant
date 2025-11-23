import { Injectable } from '@angular/core';
import { IEventResult } from '$server/modules/game/models/types';

import { CardPatterns, CardType } from '../assets/svg/card-patterns';

const CARD_SIZE = {
  HEIGHT: 400,
  WIDTH: 300,
} as const;

const ANIMATION_TIMING = {
  CLEANUP: 6000,
  FLIP: 1500,
  FLY_IN: 10,
  FLY_OUT: 4500,
} as const;

@Injectable()
export class GameNotificationService {
  private activeCards: HTMLElement[] = [];
  private activeToasts: HTMLElement[] = [];
  private isProcessingQueue = false;
  private readonly TOAST_THROTTLE_DELAY = 1000; // 1 second between toasts
  private toastQueue: string[] = [];

  ngOnDestroy() {
    // Cleanup all active cards when the service is destroyed
    this.activeCards.forEach(card => {
      if (card.parentNode) {
        card.parentNode.removeChild(card);
      }
    });
    this.activeCards = [];

    // Cleanup all active toasts
    this.activeToasts.forEach(toast => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    });
    this.activeToasts = [];
  }

  private processToastQueue() {
    if (this.isProcessingQueue || this.toastQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;
    const msg = this.toastQueue.shift();

    if (msg) {
      this.showToastImmediate(msg);

      // Start processing the next toast after a delay
      setTimeout(() => {
        this.isProcessingQueue = false;
        this.processToastQueue();
      }, this.TOAST_THROTTLE_DELAY);
    } else {
      this.isProcessingQueue = false;
    }
  }

  private repositionToasts() {
    const TOAST_SPACING = 10;
    const TOAST_HEIGHT = 50;

    this.activeToasts.forEach((toast, index) => {
      const offset = index * (TOAST_HEIGHT + TOAST_SPACING);
      toast.style.bottom = `${20 + offset}px`;
    });
  }

  private showToastImmediate(msg: string) {
    const TOAST_DURATION = 2000; // 2 seconds
    const TOAST_SPACING = 10; // spacing between toasts
    const TOAST_HEIGHT = 50; // approximate toast height

    // Calculate position for the new toast (bottom-up)
    const offset = this.activeToasts.length * (TOAST_HEIGHT + TOAST_SPACING);

    const snackbar = document.createElement('div');
    snackbar.textContent = msg;
    snackbar.style.position = 'fixed';
    snackbar.style.bottom = `${20 + offset}px`;
    snackbar.style.right = '20px';
    snackbar.style.backgroundColor = '#323232';
    snackbar.style.color = '#fff';
    snackbar.style.padding = '12px 24px';
    snackbar.style.borderRadius = '4px';
    snackbar.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
    snackbar.style.zIndex = '10000';
    snackbar.style.fontSize = '14px';
    snackbar.style.opacity = '0';
    snackbar.style.transform = 'translateX(400px)';
    snackbar.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    snackbar.style.maxWidth = '300px';
    snackbar.style.wordWrap = 'break-word';

    document.body.appendChild(snackbar);
    this.activeToasts.push(snackbar);

    // Show the toast with an appearance animation
    setTimeout(() => {
      snackbar.style.opacity = '1';
      snackbar.style.transform = 'translateX(0)';
    }, 10);

    // Remove the toast after 2 seconds
    setTimeout(() => {
      snackbar.style.opacity = '0';
      snackbar.style.transform = 'translateX(400px)';

      setTimeout(() => {
        if (snackbar.parentNode) {
          document.body.removeChild(snackbar);
        }

        // Remove from the active toasts array
        const index = this.activeToasts.indexOf(snackbar);
        if (index > -1) {
          this.activeToasts.splice(index, 1);
        }

        // Recalculate positions of remaining toasts
        this.repositionToasts();
      }, 300);
    }, TOAST_DURATION);
  }

  showCard(cardevent: NonNullable<IEventResult['cardDrawn']>) {
    const cardType = cardevent.cardType as CardType;
    const message = cardevent.card.msg;

    // Get the localized label as in card.component
    const labels: Record<string, string> = {
      'post': $localize`:@@post:Post`,
      'risk': $localize`:@@risk:Risk`,
      'surprise': $localize`:@@surprise:Surprise`,
    };
    const label = labels[cardType] || cardType;

    // Get only the pattern (not the full SVG)
    const cardPattern = CardPatterns.getPattern(cardType);

    // Parameters for scaling the pattern (reduce by 25%)
    const patternScale = 1.875; // 2.5 * 0.75 = reduced by 25%
    const scaledWidth = CardPatterns.PATTERN_WIDTH * patternScale;
    const scaledHeight = CardPatterns.PATTERN_HEIGHT * patternScale;

    // Create a container for the card
    const cardContainer = document.createElement('div');
    cardContainer.style.position = 'fixed';
    cardContainer.style.top = '50%';
    cardContainer.style.left = '50%';
    cardContainer.style.width = `${CARD_SIZE.WIDTH}px`;
    cardContainer.style.height = `${CARD_SIZE.HEIGHT}px`;
    cardContainer.style.perspective = '1500px';
    cardContainer.style.zIndex = '9999';
    cardContainer.style.transform = 'translate(-50%, -50%) translateX(-150vw) rotate(-180deg)';
    cardContainer.style.transition = 'transform 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';

    // Create the card with two sides
    const card = document.createElement('div');
    card.style.width = '100%';
    card.style.height = '100%';
    card.style.position = 'relative';
    card.style.transformStyle = 'preserve-3d';
    card.style.transition = 'transform 0.8s';

    // Back side (SVG pattern + label as in card.component)
    const cardBack = document.createElement('div');
    cardBack.style.position = 'absolute';
    cardBack.style.width = '100%';
    cardBack.style.height = '100%';
    cardBack.style.backfaceVisibility = 'hidden';
    cardBack.style.backgroundColor = '#ffffff';
    cardBack.style.borderRadius = '15px';
    cardBack.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5)';
    cardBack.style.border = '3px solid #34495e';
    cardBack.style.overflow = 'hidden';

    // Create SVG container for the pattern (centered as in card.component)
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', CARD_SIZE.WIDTH.toString());
    svg.setAttribute('height', CARD_SIZE.HEIGHT.toString());
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';

    // Create g element for the pattern with transformation (centered)
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const centerX = CARD_SIZE.WIDTH / 2 - scaledWidth / 2;
    const centerY = CARD_SIZE.HEIGHT / 2.5 - scaledHeight / 2; // slightly above center
    g.setAttribute('transform', `translate(${centerX},${centerY}) scale(${patternScale})`);
    g.innerHTML = cardPattern;
    svg.appendChild(g);

    // Add text (label) at the bottom of the card
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', (CARD_SIZE.WIDTH / 2).toString());
    text.setAttribute('y', (CARD_SIZE.HEIGHT - 40).toString());
    text.setAttribute('font-family', 'Verdana');
    text.setAttribute('font-size', '36');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', '#2c3e50');
    text.textContent = label;
    svg.appendChild(text);

    cardBack.appendChild(svg);

    // Front side (text)
    const cardFront = document.createElement('div');
    cardFront.style.position = 'absolute';
    cardFront.style.width = '100%';
    cardFront.style.height = '100%';
    cardFront.style.backfaceVisibility = 'hidden';
    cardFront.style.backgroundColor = '#ecf0f1';
    cardFront.style.borderRadius = '15px';
    cardFront.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5)';
    cardFront.style.display = 'flex';
    cardFront.style.alignItems = 'center';
    cardFront.style.justifyContent = 'center';
    cardFront.style.padding = '30px';
    cardFront.style.border = '3px solid #bdc3c7';
    cardFront.style.transform = 'rotateY(180deg)';
    cardFront.style.boxSizing = 'border-box';

    const cardText = document.createElement('p');
    cardText.style.color = '#2c3e50';
    cardText.style.fontSize = '24px';
    cardText.style.textAlign = 'center';
    cardText.style.margin = '0';
    cardText.style.lineHeight = '1.5';
    cardText.style.wordWrap = 'break-word';
    cardText.textContent = message;
    cardFront.appendChild(cardText);

    card.appendChild(cardBack);
    card.appendChild(cardFront);
    cardContainer.appendChild(card);
    document.body.appendChild(cardContainer);

    // Track active cards for cleanup
    this.activeCards.push(cardContainer);

    // Animation: fly in from off-screen with rotation
    setTimeout(() => {
      cardContainer.style.transform = 'translate(-50%, -50%) translateX(0) rotate(720deg)';
    }, ANIMATION_TIMING.FLY_IN);

    // Flip the card
    setTimeout(() => {
      card.style.transform = 'rotateY(180deg)';
    }, ANIMATION_TIMING.FLIP);

    // Fly out back
    setTimeout(() => {
      cardContainer.style.transform = 'translate(-50%, -50%) translateX(150vw) rotate(1080deg)';
    }, ANIMATION_TIMING.FLY_OUT);

    // Remove from DOM
    setTimeout(() => {
      if (cardContainer.parentNode) {
        document.body.removeChild(cardContainer);
      }
      // Remove from tracking
      const index = this.activeCards.indexOf(cardContainer);
      if (index > -1) {
        this.activeCards.splice(index, 1);
      }
    }, ANIMATION_TIMING.CLEANUP);
  }

  toast(msg: string) {
    // Add the message to the queue
    this.toastQueue.push(msg);
    // Start processing the queue
    this.processToastQueue();
  }
}
