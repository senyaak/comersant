export interface UserIdentity {
  data: { name?: string };
  id: string;
}

export interface ServerToClientEvents {
  'create-room': (roomName: string) => void;
  'disconnect': () => void;
  'enter-room': (roomName: string) => void;
  'leave-room': () => void;
  'room-is-full': () => void;
  'room-removed': () => void;
  'rooms-updated': (rooms: Room[]) => void;
  'start-game': (gameId: string) => void;
  'update-connected-users': (users: UserIdentity[]) => void;
  'update-room-users': (room: Room) => void;
  'update-rooms-list': (rooms: Room[]) => void;
  'error': (message: string) => void;
}

export interface ClientToServerEvents {
  'create-room': (roomName: string) => void;
  'enter-room': (roomName: string) => void;
  'join': () => void;
  'leave-room': () => void;
  'set-name': (name: string) => void;
  'start-game': () => void;
}

export enum Rooms {
  Lobby = 'lobby',
}

export interface Room {
  id: string;
  users: { id: string; name: string; owner: boolean }[];
}

export const RoomsPrefix = 'pregame-room-';
