import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { PlayersSettings } from 'src/modules/game/models/GameModels/game';
import { DuplicateNamesError, GamesService } from 'src/modules/game/services/games/games.service';

import { UserIdentity } from '../types';
import {
  ClientEvents,
  Room,
  Rooms,
  RoomsPrefix,
  ServerEvents,
} from './../types';

@WebSocketGateway({ namespace: 'lobby' })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() private server!: Namespace;
  constructor(private gamesService: GamesService) {}

  private get lobby() {
    return this.server.in(Rooms.Lobby);
  }

  public get rooms(): Promise<Room[]> {
    const rooms = Promise.all(
      Array.from(this.server.adapter.rooms.keys())
        .filter(room => room.includes(RoomsPrefix))
        .map(roomId => this.getRoom(roomId)),
    );
    return rooms;
  }

  get usersInlobby(): Promise<UserIdentity[]> {
    // console.log('usersInlobby');
    return this.lobby.fetchSockets().then(sockets => {
      // console.log('usersInlobby2', sockets);
      return sockets.map(({ id, data }) => ({ id, data }));
    });
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
    this.server.emit(ServerEvents.UpdateRoomsList, await this.rooms);
    this.server.emit(
      ServerEvents.UpdateConnectedUsers,
      await this.usersInlobby,
    );
  }

  @SubscribeMessage(ClientEvents.EnterRoom)
  async enterRoom(
    @MessageBody() roomName: string,
    @ConnectedSocket() socket: Socket,
  ) {
    if ((await this.server.in(roomName).fetchSockets()).length >= 2) {
      socket.emit(ServerEvents.RoomIsFull);
      return;
    }
    socket.join(roomName);
    socket.leave(Rooms.Lobby);

    socket.emit(ServerEvents.EnteredRoom, roomName);
    this.server.emit(
      ServerEvents.UpdateConnectedUsers,
      await this.usersInlobby,
    );
    this.server.emit(ServerEvents.UpdateRoomsList, await this.rooms);
    this.updateRoomUsers(roomName);
  }

  async getPlayersSettings(roomName: string): Promise<PlayersSettings[]> {
    return await this.server
      .in(roomName)
      .fetchSockets()
      .then(sockets => sockets.map(({ data: { name}, id }) => ({ name, id })));
  }

  async getRoom(roomId: string): Promise<Room> {
    const users = (await this.server.in(roomId).fetchSockets()).map(
      ({ id, data }) => ({
        id,
        name: data.name,
        owner: roomId === data.room,
      }),
    );
    return { id: roomId, users };
  }

  async handleConnection() {}

  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    if (socket.data.room) {
      this.server.in(socket.data.room).emit(ServerEvents.LeaveRoom);
      this.server.emit(ServerEvents.UpdateRoomsList, await this.rooms);
    } else if (socket.rooms.has(Rooms.Lobby)) {
      this.lobby.emit(
        ServerEvents.UpdateConnectedUsers,
        await this.usersInlobby,
      );
    }
  }

  @SubscribeMessage(ClientEvents.Join)
  async join(@ConnectedSocket() socket: Socket) {
    socket.join(Rooms.Lobby);
    this.lobby.emit(ServerEvents.UpdateConnectedUsers, await this.usersInlobby);
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
      this.server.in(socket.data.room).emit(ServerEvents.RoomRemoved);
      this.server.in(socket.data.room).socketsLeave(socket.data.room);
    } else {
      socket.leave(roomToLeave);
      this.updateRoomUsers(roomToLeave);
    }
    this.server.emit(ServerEvents.UpdateRoomsList, await this.rooms);
  }

  @SubscribeMessage(ClientEvents.SetName)
  async setName(
    @MessageBody() newName: string,
    @ConnectedSocket() socket: Socket,
  ) {
    if (socket.data.name) {
      throw new Error('Can\'t set already set name');
    }
    socket.data.name = newName;
    this.lobby.emit(ServerEvents.UpdateConnectedUsers, await this.usersInlobby);
  }

  @SubscribeMessage(ClientEvents.StartGame)
  async startGame(@ConnectedSocket() socket: Socket) {
    try {
      const gameId = this.gamesService.createGame(
        await this.getPlayersSettings(socket.data.room),
      );

      this.server.in(socket.data.room).emit(ServerEvents.StartGame, gameId);
      this.server.emit(ServerEvents.UpdateRoomsList, await this.rooms);
    } catch (error) {
      if(error instanceof DuplicateNamesError) {
        socket.emit(ServerEvents.Error, error.message);
      }
    }
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
}
