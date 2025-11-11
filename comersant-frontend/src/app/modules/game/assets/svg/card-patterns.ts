export type CardType = 'post' | 'risk' | 'surprise';

export class CardPatterns {
  static getPattern(cardType: CardType): string {
    return this.patterns[cardType] || this.patterns.post;
  }

  static getSvgElement(cardType: CardType, width: number = 300, height: number = 400): string {
    const pattern = this.getPattern(cardType);
    return `
      <svg width="${width}" height="${height}" viewBox="0 0 300 400"
           xmlns="http://www.w3.org/2000/svg">
        ${pattern}
      </svg>
    `;
  }

  static readonly PATTERN_HEIGHT = 80;
  static readonly PATTERN_WIDTH = 120;

  private static readonly patterns: Record<CardType, string> = {
    post: `
      <rect width="120" height="80" style="fill: rgb(105, 178, 248);"/>
      <path style="fill: none; stroke: rgb(255, 255, 255); stroke-width: 2px;"
            d="M 0 0 L 60 40 C 60 40 120 0 120 0"/>
    `,
    risk: `
      <rect width="120" height="80" style="fill: rgb(248, 105, 105);"/>
      <path style="fill: none; stroke: rgb(255, 255, 255); stroke-width: 2px;"
            d="M 0 0 L 60 40 C 60 40 120 0 120 0"/>
    `,
    surprise: `
      <rect width="120" height="80" style="fill: rgb(178, 248, 105);"/>
      <path style="fill: none; stroke: rgb(255, 255, 255); stroke-width: 2px;"
            d="M 0 0 L 60 40 C 60 40 120 0 120 0"/>
    `,
  };
}
