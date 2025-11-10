import { Injectable } from '@angular/core';
import { IEventResult } from '$server/modules/game/models/types';

@Injectable()
export class GameNotificationService {
  constructor() { }

  showCard(cardevent: NonNullable<IEventResult['cardDrawn']>) {
    // const svg = ''; // should be angular template later
    let svgImage = '';
    switch (cardevent.cardType) {
      case 'post':
        svgImage = 'post-card-back.svg'; // placeholder
        break;
      case 'risk':
        svgImage = 'risk-card-back.svg'; // placeholder
        break;
      case 'surprise':
        svgImage = 'surprise-card-back.svg'; // placeholder
        break;
      default: throw new Error('Invalid card type');
    }

    const message = cardevent.card.msg;

    // Создаем контейнер для карты
    const cardContainer = document.createElement('div');
    cardContainer.style.position = 'fixed';
    cardContainer.style.top = '50%';
    cardContainer.style.left = '50%';
    cardContainer.style.width = '75px';
    cardContainer.style.height = '100px';
    cardContainer.style.perspective = '1000px';
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

    // Задняя сторона (SVG)
    const cardBack = document.createElement('div');
    cardBack.style.position = 'absolute';
    cardBack.style.width = '100%';
    cardBack.style.height = '100%';
    cardBack.style.backfaceVisibility = 'hidden';
    cardBack.style.backgroundColor = '#2c3e50';
    cardBack.style.borderRadius = '15px';
    cardBack.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5)';
    cardBack.style.display = 'flex';
    cardBack.style.alignItems = 'center';
    cardBack.style.justifyContent = 'center';
    cardBack.style.border = '3px solid #34495e';
    cardBack.innerHTML = '<div style=\'color: #ecf0f1; font-size: 24px; font-weight: bold;\'>🎴</div>';

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
    const cardText = '<p style=\'color: #2c3e50; font-size: 18px; text-align: center; margin: 0;'
      + ' line-height: 1.5;\'>' + message + '</p>';
    cardFront.innerHTML = cardText;

    card.appendChild(cardBack);
    card.appendChild(cardFront);
    cardContainer.appendChild(card);
    document.body.appendChild(cardContainer);

    // Анимация: вылет из-за границы с вращением
    setTimeout(() => {
      cardContainer.style.transform = 'translate(-50%, -50%) translateX(0) rotate(720deg)';
    }, 10);

    // Переворот карты через 1.5 секунды
    setTimeout(() => {
      card.style.transform = 'rotateY(180deg)';
    }, 1500);

    // Улетает обратно через 4 секунды
    setTimeout(() => {
      cardContainer.style.transform = 'translate(-50%, -50%) translateX(150vw) rotate(1080deg)';
    }, 4500);

    // Удаляем из DOM через 6 секунд
    setTimeout(() => {
      document.body.removeChild(cardContainer);
    }, 6000);

    // TODO: использовать svgImage для загрузки картинки на задней стороне
    console.log('Card back image:', svgImage);
  }

  public toast(msg: string) {
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
