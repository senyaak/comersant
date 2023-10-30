import { Module } from '@nestjs/common';
import { EventsGateway } from './services/events/events.gateway';
import { GamesController } from './services/games/games.controller';
import { GamesService } from './services/games/games.service';

@Module({
  providers: [EventsGateway, GamesService],
  exports: [GamesService],
  controllers: [GamesController],
})
export class GameModule {}
