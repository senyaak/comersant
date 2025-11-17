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

import {
  ClientToServerEvents,
  Room,
  Rooms,
  RoomsPrefix,
  ServerToClientEvents,
  UserIdentity,
} from './../types';

@WebSocketGateway({ namespace: 'lobby' })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() private server!: Namespace<ClientToServerEvents, ServerToClientEvents>;
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
      return sockets.map(({ id, data }: { id: string; data: { name?: string } }) => ({ id, data }));
    });
  }

  @SubscribeMessage('create-room')
  async createRoom(
    @MessageBody() roomName: string,
    @ConnectedSocket() socket: Socket,
  ) {
    const room = `${RoomsPrefix}${roomName}`;
    socket.data.room = room;
    socket.leave(Rooms.Lobby);
    await socket.join(room);

    socket.emit('create-room', room);
    this.server.emit('update-rooms-list', await this.rooms);
    this.server.emit(
      'update-connected-users',
      await this.usersInlobby,
    );
  }

  @SubscribeMessage('enter-room')
  async enterRoom(
    @MessageBody() roomName: string,
    @ConnectedSocket() socket: Socket,
  ) {
    if ((await this.server.in(roomName).fetchSockets()).length >= 2) {
      socket.emit('room-is-full');
      return;
    }
    socket.join(roomName);
    socket.leave(Rooms.Lobby);

    socket.emit('enter-room', roomName);
    this.server.emit(
      'update-connected-users',
      await this.usersInlobby,
    );
    this.server.emit('update-rooms-list', await this.rooms);
    this.updateRoomUsers(roomName);
  }

  async getPlayersSettings(roomName: string): Promise<PlayersSettings[]> {
    return await this.server
      .in(roomName)
      .fetchSockets()
      .then(sockets =>
        sockets.map(
          ({ data: { name }, id }: { data: { name?: string }; id: string }) => ({ name: name || '', id }),
        ),
      );
  }

  async getRoom(roomId: string): Promise<Room> {
    const users = (await this.server.in(roomId).fetchSockets()).map(
      ({ id, data }: { id: string; data: { name?: string; room?: string } }) => ({
        id,
        name: data.name ?? '',
        owner: roomId === data.room,
      }),
    );
    return { id: roomId, users };
  }

  async handleConnection() {}

  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    if (socket.data.room) {
      this.server.in(socket.data.room).emit('leave-room');
      this.server.emit('update-rooms-list', await this.rooms);
    } else if (socket.rooms.has(Rooms.Lobby)) {
      this.lobby.emit(
        'update-connected-users',
        await this.usersInlobby,
      );
    }
  }

  @SubscribeMessage('join')
  async join(@ConnectedSocket() socket: Socket) {
    socket.join(Rooms.Lobby);
    this.lobby.emit('update-connected-users', await this.usersInlobby);
  }

  @SubscribeMessage('leave-room')
  async leaveRoom(@ConnectedSocket() socket: Socket) {
    const roomToLeave = Array.from(socket.rooms).find((room: string) =>
      room.startsWith(RoomsPrefix),
    );
    if (!roomToLeave) {
      return;
    }
    if (socket.data.room) {
      this.server.in(socket.data.room).emit('room-removed');
      this.server.in(socket.data.room).socketsLeave(socket.data.room);
    } else {
      socket.leave(roomToLeave);
      this.updateRoomUsers(roomToLeave);
    }
    this.server.emit('update-rooms-list', await this.rooms);
  }

  @SubscribeMessage('set-name')
  async setName(
    @MessageBody() newName: string,
    @ConnectedSocket() socket: Socket,
  ) {
    if (socket.data.name) {
      throw new Error('Can\'t set already set name');
    }
    socket.data.name = newName;
    this.lobby.emit('update-connected-users', await this.usersInlobby);
  }

  @SubscribeMessage('start-game')
  async startGame(@ConnectedSocket() socket: Socket) {
    try {
      const gameId = this.gamesService.createGame(
        await this.getPlayersSettings(socket.data.room),
      );

      this.server.in(socket.data.room).emit('start-game', gameId);
      this.server.emit('update-rooms-list', await this.rooms);
    } catch (error) {
      if(error instanceof DuplicateNamesError) {
        socket.emit('error', error.message);
      }
    }
  }

  async updateRoomUsers(room: string) {
    const users: Room['users'] = (
      await this.server.in(room).fetchSockets()
    ).map((socket: { id: string; data: { name?: string; room?: string } }) => ({
      id: socket.id,
      name: socket.data.name || '',
      owner: socket.data.room === room,
    }));
    this.server
      .in(room)
      .emit('update-room-users', { id: room, users });
  }
}
