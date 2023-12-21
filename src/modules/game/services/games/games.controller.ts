import { Controller, Get, Param } from '@nestjs/common';
import { GamesService } from './games.service';
import { Routes } from '$types/routes';

@Controller(Routes.games)
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get('/:id')
  game(@Param('id') id: string) {
    console.log('id', id);
    return this.gamesService.getGame(id);
  }

  // @Post()
  // createGame() {}
}
