import { Module } from '@nestjs/common';
import { EventsGateway } from './events/events.gateway';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
// import { ServeStaticModule } from '@nestjs/serve-static';
// import { join } from 'path';

@Module({
  imports: [],
  controllers: [],
  providers: [EventsGateway],
})
export class LobbyModule {}