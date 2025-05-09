import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import {
  WebSocketGateway
} from '@nestjs/websockets';

@WebSocketGateway({ namespace: 'game' })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  handleConnection(/*client: any, ...args: any[]*/) {
    // console.log(client, ...args);
  }
  handleDisconnect(/*client: any*/) {
    // console.log(client);
  }

  @SubscribeMessage('message')
  handleMessage(client: unknown, payload: unknown): string {
    console.log('ad', client, payload);
    return 'Hello world!';
  }

  // @SubscribeMessage(ClientEvents.CreateRoom)
  // async createRoom(
  //   @ConnectedSocket() socket: Socket,
  //   @MessageBody() roomName: string,
  // ) {
  // }
}
