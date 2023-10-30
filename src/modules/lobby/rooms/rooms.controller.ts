import { Controller, Get /*Param*/, Param } from '@nestjs/common';
import { EventsGateway } from '../events/events.gateway';
import { Room } from '../types';

@Controller('rooms')
export class RoomsController {
  constructor(private eventsGateway: EventsGateway) {}
  @Get()
  getRooms() {
    return this.eventsGateway.rooms;
  }
  @Get(':id')
  async getRoom(@Param() { id }: { id: string }): Promise<Room> {
    return this.eventsGateway.getRoom(id);
  }
}
