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

  ngOnDestroy() {
    // Cleanup всех активных карт при уничтожении сервиса
    this.activeCards.forEach(card => {
      if (card.parentNode) {
        card.parentNode.removeChild(card);
      }
    });
    this.activeCards = [];
  }

  showCard(cardevent: NonNullable<IEventResult['cardDrawn']>) {
    const cardType = cardevent.cardType as CardType;
    const message = cardevent.card.msg;

    // Получаем локализованный label как в card.component
    const labels: Record<string, string> = {
      'post': $localize`:@@post:Post`,
      'risk': $localize`:@@risk:Risk`,
      'surprise': $localize`:@@surprise:Surprise`,
    };
    const label = labels[cardType] || cardType;

    // Получаем только паттерн (не полный SVG)
    const cardPattern = CardPatterns.getPattern(cardType);

    // Параметры для масштабирования паттерна (уменьшаем на 25%)
    const patternScale = 1.875; // 2.5 * 0.75 = меньше на 25%
    const scaledWidth = CardPatterns.PATTERN_WIDTH * patternScale;
    const scaledHeight = CardPatterns.PATTERN_HEIGHT * patternScale;

    // Создаем контейнер для карты
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

    // Создаем карту с двумя сторонами
    const card = document.createElement('div');
    card.style.width = '100%';
    card.style.height = '100%';
    card.style.position = 'relative';
    card.style.transformStyle = 'preserve-3d';
    card.style.transition = 'transform 0.8s';

    // Задняя сторона (SVG паттерн + label как в card.component)
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

    // Создаем SVG контейнер для паттерна (центрируем как в card.component)
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', CARD_SIZE.WIDTH.toString());
    svg.setAttribute('height', CARD_SIZE.HEIGHT.toString());
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';

    // Создаем g элемент для паттерна с трансформацией (центрируем)
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const centerX = CARD_SIZE.WIDTH / 2 - scaledWidth / 2;
    const centerY = CARD_SIZE.HEIGHT / 2.5 - scaledHeight / 2; // чуть выше центра
    g.setAttribute('transform', `translate(${centerX},${centerY}) scale(${patternScale})`);
    g.innerHTML = cardPattern;
    svg.appendChild(g);

    // Добавляем текст (label) внизу карты
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

    // Передняя сторона (текст)
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

    // Трекаем активные карты для cleanup
    this.activeCards.push(cardContainer);

    // Анимация: вылет из-за границы с вращением
    setTimeout(() => {
      cardContainer.style.transform = 'translate(-50%, -50%) translateX(0) rotate(720deg)';
    }, ANIMATION_TIMING.FLY_IN);

    // Переворот карты
    setTimeout(() => {
      card.style.transform = 'rotateY(180deg)';
    }, ANIMATION_TIMING.FLIP);

    // Улетает обратно
    setTimeout(() => {
      cardContainer.style.transform = 'translate(-50%, -50%) translateX(150vw) rotate(1080deg)';
    }, ANIMATION_TIMING.FLY_OUT);

    // Удаляем из DOM
    setTimeout(() => {
      if (cardContainer.parentNode) {
        document.body.removeChild(cardContainer);
      }
      // Удаляем из трекинга
      const index = this.activeCards.indexOf(cardContainer);
      if (index > -1) {
        this.activeCards.splice(index, 1);
      }
    }, ANIMATION_TIMING.CLEANUP);
  }

  toast(msg: string) {
    const snackbar = document.createElement('div');
    snackbar.textContent = msg;
    snackbar.style.position = 'fixed';
    snackbar.style.bottom = '20px';
    snackbar.style.left = '50%';
    snackbar.style.transform = 'translateX(-50%)';
    snackbar.style.backgroundColor = '#323232';
    snackbar.style.color = '#fff';
    snackbar.style.padding = '10px 20px';
    snackbar.style.borderRadius = '4px';
    snackbar.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
    snackbar.style.zIndex = '1000';
    snackbar.style.fontSize = '14px';
    snackbar.style.opacity = '0';
    snackbar.style.transition = 'opacity 0.3s ease';

    document.body.appendChild(snackbar);

    // Show the snackbar
    setTimeout(() => {
      snackbar.style.opacity = '1';
    }, 10);

    // Remove the snackbar after 3 seconds
    setTimeout(() => {
      snackbar.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(snackbar);
      }, 300);
    }, 3000);
  }
}
