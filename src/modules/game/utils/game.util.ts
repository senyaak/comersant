import { Socket } from 'socket.io';

// Type guard for gameId validation
export function isValidGameIdOrName(gameId: unknown): gameId is string {
  return typeof gameId === 'string' && gameId.length > 0;
}

// Helper function to extract validated gameId from socket
export function getValidatedGameId(client: Socket): string {
  const gameId = client.handshake.query.gameId;
  if (!isValidGameIdOrName(gameId)) {
    throw new Error('Game ID is required and must be a non-empty string');
  }
  return gameId;
}

export function getValidatedUserName(client: Socket): string {
  const userName = client.handshake.query.userName;
  if (!isValidGameIdOrName(userName)) {
    throw new Error('userName is required and must be a non-empty string');
  }
  return userName;
}

// Custom decorator for automatic gameId validation
export function ValidateGameId(target: object, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value as (...args: unknown[]) => unknown;

  descriptor.value = function(...args: unknown[]) {
    // Find the client socket in the arguments
    const client = args.find((arg): arg is Socket =>
      arg !== null &&
      typeof arg === 'object' &&
      'handshake' in arg &&
      typeof (arg as Socket).handshake === 'object',
    );

    if (client) {
      // Validate gameId early
      getValidatedGameId(client);
    }

    return method.apply(this, args);
  };
}
