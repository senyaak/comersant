export interface UserIdentity {
  data: { name?: string };
  id: string;
}

export enum ServerEvents {
  CreatedRoom = 'create-room',
  Disconnect = 'disconnect',
  EnteredRoom = 'enter-room',
  LeaveRoom = 'leave-room',
  RoomIsFull = 'room-is-full',
  RoomRemoved = 'room-removed',
  RoomsUpdated = 'rooms-updated',
  StartGame = 'start-game',
  UpdateConnectedUsers = 'update-connected-users',
  UpdateRoomUsers = 'update-room-users',
  UpdateRoomsList = 'update-rooms-list',
  Error = 'error',
}
export enum ClientEvents {
  CreateRoom = 'create-room',
  EnterRoom = 'enter-room',
  Join = 'join',
  LeaveRoom = 'leave-room',
  SetName = 'set-name',
  StartGame = 'start-game',
}
export enum Rooms {
  Lobby = 'lobby',
}

export interface Room {
  id: string;
  users: { id: string; name: string; owner: boolean }[];
}

export const RoomsPrefix = 'pregame-room-';
