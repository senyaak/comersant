import { Module } from '@nestjs/common';
import { EventsGateway } from './events/events.gateway';
import { RoomsController } from './rooms/rooms.controller';
import { GameModule } from '../game/game.module';

@Module({
  imports: [GameModule],
  controllers: [RoomsController],
  providers: [EventsGateway],
})
export class LobbyModule {}
