import { Controller, Get, Param } from '@nestjs/common';
import { Routes } from '$types/routes';

import { EventsGateway } from '../events/events.gateway';
import { Room } from '../types';

@Controller(Routes.lobby)
export class RoomsController {
  constructor(private eventsGateway: EventsGateway) {}
  @Get()
  async getRooms(): Promise<Room[]> {
    return await this.eventsGateway.rooms;
  }
  @Get(':id')
  async getRoom(@Param() { id }: { id: string }): Promise<Room> {
    return this.eventsGateway.getRoom(id);
  }
}
