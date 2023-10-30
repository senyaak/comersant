import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket, Namespace } from 'socket.io';
import { ClientEvents, Room, RoomsPrefix, ServerEvents } from './../types';
import { Rooms } from './../types';
import { UserIdentity } from '../types';

@WebSocketGateway({ namespace: 'lobby' })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() private server: Namespace;
  constructor() {}

  async handleConnection() {}
  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    if (socket.data.room) {
      this.server.in(socket.data.room).emit(ServerEvents.LeaveRoom);
      this.server.emit(ServerEvents.UpdateRoomsList, this.rooms);
    } else if (socket.rooms.has(Rooms.Lobby)) {
      this.lobby.emit(ServerEvents.UpdateConnectedUsers, await this.usersList);
    }
  }

  @SubscribeMessage(ClientEvents.SetName)
  async setName(
    @MessageBody() newName: string,
    @ConnectedSocket() socket: Socket,
  ) {
    if (socket.data.name) {
      throw new Error("Can't set already set name");
    }
    socket.data.name = newName;
    this.lobby.emit(ServerEvents.UpdateConnectedUsers, await this.usersList);
  }

  @SubscribeMessage(ClientEvents.Join)
  async join(@ConnectedSocket() socket: Socket) {
    socket.join(Rooms.Lobby);
    this.lobby.emit(ServerEvents.UpdateConnectedUsers, await this.usersList);
  }

  @SubscribeMessage(ClientEvents.CreateRoom)
  async createRoom(
    @MessageBody() roomName: string,
    @ConnectedSocket() socket: Socket,
  ) {
    const room = `${RoomsPrefix}${roomName}`;
    socket.data.room = room;
    socket.leave(Rooms.Lobby);
    await socket.join(room);

    socket.emit(ServerEvents.CreatedRoom, room);
    this.server.emit(ServerEvents.UpdateRoomsList, this.rooms);
    this.server.emit(ServerEvents.UpdateConnectedUsers, await this.usersList);
  }

  @SubscribeMessage(ClientEvents.EnterRoom)
  async enterRoom(
    @MessageBody() roomName: string,
    @ConnectedSocket() socket: Socket,
  ) {
    socket.join(roomName);
    socket.leave(Rooms.Lobby);

    socket.emit(ServerEvents.EnteredRoom, roomName);
    this.server.emit(ServerEvents.UpdateConnectedUsers, await this.usersList);

    this.updateRoomUsers(roomName);
  }

  @SubscribeMessage(ClientEvents.LeaveRoom)
  async leaveRoom(@ConnectedSocket() socket: Socket) {
    const roomToLeave = Array.from(socket.rooms).find(room =>
      room.startsWith(RoomsPrefix),
    );
    if (!roomToLeave) {
      return;
    }
    if (socket.data.room) {
      await this.server.in(socket.data.room).emit(ServerEvents.RoomRemoved);
      await this.server.in(socket.data.room).socketsLeave(socket.data.room);
      await this.server.emit(ServerEvents.UpdateRoomsList, this.rooms);
    } else {
      socket.leave(roomToLeave);
      this.updateRoomUsers(roomToLeave);
    }
  }

  async getRoom(roomId): Promise<Room> {
    const users = (await this.server.in(roomId).fetchSockets()).map(
      ({ id, data }) => ({
        id,
        name: data.name,
        owner: roomId === data.room,
      }),
    );
    return { id: roomId, users };
  }

  private get lobby() {
    return this.server.in(Rooms.Lobby);
  }

  get usersList(): Promise<UserIdentity[]> {
    return this.lobby.fetchSockets().then(sockets => {
      return sockets.map(({ id, data }) => ({ id, data }));
    });
  }

  public get rooms(): string[] {
    const rooms = Array.from(this.server.adapter.rooms.keys()).filter(room =>
      room.includes(RoomsPrefix),
    );
    return rooms;
  }

  async updateRoomUsers(room: string) {
    const users: Room['users'] = (
      await this.server.in(room).fetchSockets()
    ).map(socket => ({
      id: socket.id,
      name: socket.data.name,
      owner: socket.data.room === room,
    }));
    this.server
      .in(room)
      .emit(ServerEvents.UpdateRoomUsers, { id: room, users });
  }
  //   @SubscribeMessage('events') handleEvent(
  //     @MessageBody() data: string,
  //     @ConnectedSocket() socket: Socket,
  //   ) {
  //
  //   }
}
