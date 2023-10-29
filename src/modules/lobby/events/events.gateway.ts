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
import { ClientEvents, RoomsPrefix, ServerEvents } from './../types';
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
    socket.join(room);
    socket.leave(Rooms.Lobby);

    socket.data.userroom = room;

    socket.emit(ServerEvents.JoinedRoom, room);
    this.server.emit(ServerEvents.UpdateRoomsList, this.rooms);
    this.server.emit(ServerEvents.UpdateConnectedUsers, await this.usersList);
  }

  @SubscribeMessage(ClientEvents.LeaveRoom)
  async leaveRoom() {
    // @ConnectedSocket() socket: Socket, // @MessageBody() roomName: string,
    // socket.data.name = newName;
    // const room = `${RoomsPrefix}${roomName}`;
    // socket.join(room);
    // socket.data.userroom = room;
    // this.lobby.emit(ServerEvents.JoinedRoom, room);
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
  //   @SubscribeMessage('events') handleEvent(
  //     @MessageBody() data: string,
  //     @ConnectedSocket() socket: Socket,
  //   ) {
  //
  //   }
}
