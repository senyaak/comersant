import {
  ConnectedSocket,
  MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';

import type { Game } from '../../models/GameModels/game';
import type { PropertyBoughtResultError, PropertyBoughtResultSuccess } from '../../models/types';

import { getValidatedGameId, getValidatedUserName, ValidateGameId } from '../../utils/game.util';
import { GamesService } from '../games/games.service';
import { ClientToServerEvents, ServerToClientEvents } from './types';

@WebSocketGateway({ namespace: 'game' })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() private server!: Namespace<ClientToServerEvents, ServerToClientEvents>;
  private subscribedGames = new Set<string>();

  constructor(private gamesService: GamesService) {
    this.gamesService.Games.subscribe(games => {
      for (const game of games) this.attachGameListeners(game);
    });
  }

  private attachGameListeners(game: Game): void {
    if (this.subscribedGames.has(game.id)) return;
    this.subscribedGames.add(game.id);
    game.events.on('playerEliminated', (data: { playerId: string; playerName: string }) => {
      this.server.to(`game-${game.id}`).emit('player_eliminated', [data]);
    });
    game.events.on('gameOver', (data: { winnerId: string; winnerName: string }) => {
      this.server.to(`game-${game.id}`).emit('game_over', data);
    });
  }

  @SubscribeMessage('buyProperty')
  @ValidateGameId
  handleBuyProperty(
    @ConnectedSocket() client: Socket,
  ): void {
    const gameId = getValidatedGameId(client);

    try {
      const result = this.gamesService.getGame(gameId).buyProperty();
      this.server.to(`game-${gameId}`).emit('property_bought', result);
    } catch (error) {
      console.error('Error buying property:', error);
      client.emit('property_bought', {success: false} as PropertyBoughtResultError);
    }
  }

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

    this.server.to(`game-${gameId}`).emit('user_connected', {name, id: newId});
  }

  handleDisconnect(/*client: any*/) {
    // console.log(client);
  }

  @SubscribeMessage('nextTurn')
  @ValidateGameId
  handleNextTurn(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { diceCounter: number },
  ): void {
    const gameId = getValidatedGameId(client);

    const result = this.gamesService.getGame(gameId).nextTurn(client.id, payload.diceCounter);
    if(result.turn_progress) {
      this.server.to(`game-${gameId}`).emit('turn_progress', ...result.turn_progress);
    }
    if(result.event_result) {
      this.server.to(`game-${gameId}`).emit('event_result', ...result.event_result);
    }
    if(result.turn_finished) {
      this.server.to(`game-${gameId}`).emit('turn_finished', ...result.turn_finished);
    }
  }

  @SubscribeMessage('placeBid')
  @ValidateGameId
  handlePlaceBid(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { amount: number },
  ): void {
    const gameId = getValidatedGameId(client);

    try {
      const {
        eventData,
        finished,
        invalidBid,
      } = this.gamesService.getGame(gameId).auctionPlaceBid(client.id, payload.amount);
      // If bidder received a failure, notify only them
      if (invalidBid) {
        client.emit('bid_failed', invalidBid);
      }
      // Publish auction result if finished, otherwise emit state update
      if (finished) {
        if (finished.success) {
          this.server.to(`game-${gameId}`).emit('property_bought', finished as PropertyBoughtResultSuccess);
        } else {
          this.server.to(`game-${gameId}`).emit('auction_failed', { propertyIndex: finished.propertyIndex });
        }
      } else {
        this.server.to(`game-${gameId}`).emit('auction_updated', eventData);
      }
    } catch (error) {
      console.error('Error placing bid:', error);
    }
  }

  @SubscribeMessage('refuseProperty')
  @ValidateGameId
  handleRefuseProperty(
    @ConnectedSocket() client: Socket,
  ): void {
    const gameId = getValidatedGameId(client);

    try {
      // TODO: check incorrect active state/event call
      const { eventData, finished } = this.gamesService.getGame(gameId).auctionPass(client.id);
      // Publish auction result if finished, otherwise emit state update
      if (finished) {
        if (finished.success) {
          this.server.to(`game-${gameId}`).emit('property_bought', finished as PropertyBoughtResultSuccess);
        } else {
          this.server.to(`game-${gameId}`).emit('auction_failed', { propertyIndex: finished.propertyIndex });
        }
      } else {
        this.server.to(`game-${gameId}`).emit('auction_updated', eventData);
      }
    } catch (error) {
      console.error('Error refusing property:', error);
    }
  }

}
