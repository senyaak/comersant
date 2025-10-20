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
  newOwnerId: Player['id'];
  propertyIndex: string;
}
export interface PropertyBoughtResultSuccess {
  success: false;
}
