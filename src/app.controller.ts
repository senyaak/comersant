import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Retrieves the hello message.
   *
   * @returns {string} The hello message.
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
