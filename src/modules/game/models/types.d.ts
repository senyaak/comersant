export type NextTurnResult = NextTurnSuccess | NextTurnError;

interface NextTurnError {
  success: false,
  message: 'Game not found',
}
interface NextTurnSuccess {
  success: true,
  data: {
    turnResult: ITurnResult,
    currentPlayer: IGame['currentPlayer'],
    turn: IGame['currentTurnState'],
  },
  message: 'Turn processed successfully'

}
