export interface ServerToClientEvents {
  propertyBought: (data: { success: boolean; message: string; propertyId?: string }) => void;
  turn_progress: (data: NextTurnResult) => void;
  user_connected: (data: { name: string; id: string }) => void;

  // test: (data: { val: string }) => void;
}

export interface ClientToServerEvents {
  nextTurn: (payload: { diceCounter: number }) => void;
  buyProperty: () => void;
  message: () => void;
}
