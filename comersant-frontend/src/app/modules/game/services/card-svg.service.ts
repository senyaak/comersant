import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CardSvgService {
  private readonly patterns: Record<string, string> = {
    post: `
      <rect width="300" height="400" style="fill: rgb(105, 178, 248);"/>
      <path style="fill: none; stroke: rgb(255, 255, 255); stroke-width: 2px;"
            d="M 0 0 L 150 200 C 150 200 300 0 300 0"/>
    `,
    risk: `
      <rect width="300" height="400" style="fill: rgb(248, 105, 105);"/>
      <path style="fill: none; stroke: rgb(255, 255, 255); stroke-width: 2px;"
            d="M 0 0 L 150 200 C 150 200 300 0 300 0"/>
    `,
    surprise: `
      <rect width="300" height="400" style="fill: rgb(178, 248, 105);"/>
      <path style="fill: none; stroke: rgb(255, 255, 255); stroke-width: 2px;"
            d="M 0 0 L 150 200 C 150 200 300 0 300 0"/>
    `,
  };

  getPattern(cardType: string): string {
    return this.patterns[cardType] || this.patterns['post'];
  }

  getSvgElement(cardType: string, width: number = 300, height: number = 400): string {
    const pattern = this.getPattern(cardType);
    return `
      <svg width="${width}" height="${height}" viewBox="0 0 300 400"
           xmlns="http://www.w3.org/2000/svg">
        ${pattern}
      </svg>
    `;
  }
}
