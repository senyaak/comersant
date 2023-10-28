import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: 'lobby' })
export class EventsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;
  constructor() {}

  async handleConnection(client: Socket /* ...args: any[]*/) {
    /** after connection join the lobby */
    client.join('lobby');
    /** get and send list of rooms to all users in lobby room */
    const roomList = (await this.server.in('lobby').fetchSockets()).map(
      ({ id }) => id,
    );
    this.server.in('lobby').emit('players_list', roomList);
  }

  /**
   * Handles the event.
   *
   * @param {string} data - The data received from the event.
   * @return {string} The data returned from the event.
   */
  @SubscribeMessage('events')
  handleEvent(
    @MessageBody() data: string,
    // @ConnectedSocket() socket: Socket,
  ): string {
    return data;
  }
}
