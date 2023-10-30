import { Controller, Post } from '@nestjs/common';

@Controller('games')
export class GamesController {
  @Post()
  createGame() {}
}
