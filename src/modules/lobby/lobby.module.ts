import { Module } from '@nestjs/common';
import { EventsGateway } from './events/events.gateway';
import { RoomsController } from './rooms/rooms.controller';

@Module({
  imports: [],
  controllers: [RoomsController],
  providers: [EventsGateway],
})
export class LobbyModule {}
