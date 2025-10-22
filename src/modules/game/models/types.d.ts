export type NextTurnResult = NextTurnSuccess | NextTurnError;

export interface ITurnResult {
  diceRoll?: number[];
  newPlayerPosition?: number;
}

export interface NextTurnError {
  success: false,
  message: 'Game not found',
}

export interface NextTurnSuccess {
  success: true,
  data: {
    turnResult: ITurnResult,
    currentPlayer: IGame['currentPlayer'],
    turn: IGame['currentTurnState'],
  },
  message: 'Turn processed successfully'

}

export type PropertyBoughtResult = PropertyBoughtResultSuccess | PropertyBoughtResultError;
export interface PropertyBoughtResultSuccess {
  success: true;
  oldOwnerId: Player['id'] | null;
  newOwnerId: Player['id'];
  propertyIndex: number;
  price: number;
}
export interface PropertyBoughtResultError {
  success: false;
}
