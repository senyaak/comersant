import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { LobbyModule } from './modules/lobby/lobby.module';
import { GameModule } from './modules/game/game.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'comersant-frontend', 'documentation'),
      serveRoot: '/docs/frontend',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'documentation'),
      serveRoot: '/docs/backend',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'src', 'static'),
      serveRoot: '/docs/',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(
        __dirname,
        '..',
        'comersant-frontend',
        'dist',
        'comersant-frontend',
      ),
    }),
    LobbyModule,
    GameModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
