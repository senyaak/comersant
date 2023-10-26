import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  /** @returns `Hello wrold!` string */
  getHello(): string {
    return 'Hello World!';
  }
}
