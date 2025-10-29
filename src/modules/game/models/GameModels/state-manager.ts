export enum GameStateType {
  Active = 'active',
  WaitingForPlayerChoice = 'waiting_player_choice',
  WaitingForMoveToCenter = 'waiting_move_center',
  WaitingForTrade = 'waiting_trade',
  WaitingForPropertyAction = 'waiting_property_action',
}

export class StateManager {
  constructor(
    private context: Record<string, unknown> = {},
    private currentState: GameStateType = GameStateType.Active,
    private expectedPlayerIds: string[] = [],
  ) {
  }

  get expectedPlayers(): string[] {
    return this.expectedPlayerIds;
  }

  get gameContext(): Record<string, unknown> {
    return this.context;
  }

  get isWaiting(): boolean {
    return this.currentState !== GameStateType.Active;
  }

  get state(): GameStateType {
    return this.currentState;
  }

  clearWaiting(): void {
    this.currentState = GameStateType.Active;
    this.expectedPlayerIds = [];
    this.context = {};
  }

  isPlayerExpected(playerId: string): boolean {
    return this.expectedPlayerIds.includes(playerId);
  }

  isStateValid(requiredState: GameStateType): boolean {
    return this.currentState === requiredState;
  }

  setWaiting(state: GameStateType, playerIds: string[], contextData?: Record<string, unknown>): void {
    this.currentState = state;
    this.expectedPlayerIds = playerIds;
    this.context = contextData || {};
  }
}
