import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';

import type { NextTurnResult } from '../../models/types';

import { getValidatedGameId, getValidatedUserName, ValidateGameId } from '../../utils/game.util';
import { GamesService } from '../games/games.service';

@WebSocketGateway({ namespace: 'game' })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() private server!: Namespace;
  constructor(private gamesService: GamesService) {}

  // afterInit(server: Server) {
  //   console.log('Game Gateway initialized');
  // }

  @ValidateGameId
  handleConnection(
    @ConnectedSocket() client: Socket,
    // @MessageBody() _payload: unknown,
  ) {
    // handle reconnection logic here
    const gameId = getValidatedGameId(client);
    const name = getValidatedUserName(client);

    client.data = {name};

    const newId = this.gamesService.updatePlayerId(gameId, client.id, name);
    client.join(`game-${gameId}`);
    console.log('connected', this.gamesService.getGame(gameId));

    this.server.to(`game-${gameId}`).emit('user_connected', {name, id: newId});
  }

  @SubscribeMessage('nextTurn')
  @ValidateGameId
  handleNextTurn(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { diceCounter: number },
  ): void {
    console.log('nextTurn payload:', payload);
    const gameId = getValidatedGameId(client);

    const result = this.gamesService.getGame(gameId).nextTurn(client.id, payload.diceCounter);
    console.log('emit turn_progress', result);
    this.server.to(`game-${gameId}`).emit('turn_progress', {
      message: 'Turn processed successfully',
      success: true,
      data: {
        turnResult: result,
        currentPlayer: this.gamesService.getGame(gameId).CurrentPlayer,
        turn: this.gamesService.getGame(gameId).CurrentTurnState,
      },
    } satisfies NextTurnResult);
  }

  handleDisconnect(/*client: any*/) {
    // console.log(client);
  }

  @ValidateGameId
  @SubscribeMessage('message')
  handleMessage(
  // @ConnectedSocket() client: Socket,
  // @MessageBody() payload: unknown,
  ): NextTurnResult {
    try {
      throw new Error('Test error');
      // console.log('ad', client, payload);

      // const gameId = getValidatedGameId(client);
      // const game = this.gamesService.getGame(gameId);
      // console.log('Game state:', game);

      // // game.nextTurn();
      // return {
      //   success: true,
      //   data: {
      //     currentPlayer: game.CurrentPlayer,
      //     turn: game.CurrentTurnState,
      //   },
      //   message: 'Turn processed successfully',
      // };
    } catch (error) {
      console.error('Error processing message:', error);
      return {
        success: false,
        message: 'Game not found',
      };
    }
  }

  // @SubscribeMessage(ClientEvents.CreateRoom)
  // async createRoom(
  //   @ConnectedSocket() socket: Socket,
  //   @MessageBody() roomName: string,
  // ) {
  // }
}
