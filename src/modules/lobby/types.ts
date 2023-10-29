export interface UserIdentity {
  id: string;
  data: { name?: string };
}

export enum ServerEvents {
  JoinedRoom = 'joined-room',
  UpdateConnectedUsers = 'update-connected-users',
  RoomsUpdated = 'rooms-updated',
  UpdateRoomsList = 'update-rooms-list',
  LeaveRoom = 'leave-room',
}
export enum ClientEvents {
  SetName = 'set-name',
  CreateRoom = 'create-room',
  LeaveRoom = 'leave-room',
  Join = 'join',
}
export enum Rooms {
  Lobby = 'lobby',
}

export const RoomsPrefix = 'pregame-room-';
