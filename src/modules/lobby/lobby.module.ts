import { Module } from '@nestjs/common';

import { GameModule } from '../game/game.module';
import { EventsGateway } from './events/events.gateway';
import { RoomsController } from './rooms/rooms.controller';

@Module({
  imports: [GameModule],
  controllers: [RoomsController],
  providers: [EventsGateway],
})
export class LobbyModule {}
