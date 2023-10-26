import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
} from '@nestjs/websockets';
// import {} from '@nestjs/platform-socket.io';
// import { Controller, Get } from '@nestjs/common';
// import { AppService } from './app.service';

// @WebSocketGateway()
@WebSocketGateway({ namespace: 'lobby' })
export class EventsGateway implements OnGatewayConnection {
  constructor() {}

  handleConnection(client: any, ...args: any[]) {
    console.log('handleConnection', args);
  }

  /**
   * Handles the event.
   *
   * @param {string} data - The data received from the event.
   * @return {string} The data returned from the event.
   */
  @SubscribeMessage('events')
  // handleEvent(client: Socket, data: string): string {
  handleEvent(
    @MessageBody() data: string,
    @ConnectedSocket() socket: /*Socket */ any,
  ): string {
    console.log('data', data);
    // console.log('data', data, socket);
    return data;
  }
}
