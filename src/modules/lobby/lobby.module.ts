import { Module } from '@nestjs/common';
import { EventsGateway } from './events/events.gateway';
import { RoomsController } from './rooms/rooms.controller';
import { GamesService } from '../game/services/games/games.service';
import { GameModule } from '../game/game.module';

@Module({
  imports: [GameModule],
  controllers: [RoomsController],
  providers: [EventsGateway, GamesService],
})
export class LobbyModule {}
