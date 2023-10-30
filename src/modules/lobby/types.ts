export interface UserIdentity {
  data: { name?: string };
  id: string;
}

export enum ServerEvents {
  CreatedRoom = 'create-room',
  Disconnect = 'disconnect',
  EnteredRoom = 'enter-room',
  LeaveRoom = 'leave-room',
  RoomRemoved = 'room-removed',
  RoomsUpdated = 'rooms-updated',
  UpdateConnectedUsers = 'update-connected-users',
  UpdateRoomUsers = 'update-room-users',
  UpdateRoomsList = 'update-rooms-list',
}
export enum ClientEvents {
  CreateRoom = 'create-room',
  EnterRoom = 'enter-room',
  Join = 'join',
  LeaveRoom = 'leave-room',
  SetName = 'set-name',
}
export enum Rooms {
  Lobby = 'lobby',
}

export interface Room {
  id: string;
  users: { id: string; name: string; owner: boolean }[];
}

export const RoomsPrefix = 'pregame-room-';
