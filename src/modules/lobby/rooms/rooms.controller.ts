import { Controller, Get } from '@nestjs/common';
import { EventsGateway } from '../events/events.gateway';

@Controller('rooms')
export class RoomsController {
  constructor(private eventsGateway: EventsGateway) {}
  @Get()
  getRooms() {
    return this.eventsGateway.rooms;
  }
}
