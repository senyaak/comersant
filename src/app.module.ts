import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GameModule } from './modules/game/game.module';
import { LobbyModule } from './modules/lobby/lobby.module';

@Module({
  imports: [
    // Backend API документация
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'documentation'),
      serveRoot: '/docs/backend',
    }),
    // Frontend документация
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'comersant-frontend', 'documentation'),
      serveRoot: '/docs/frontend',
    }),
    // Architecture диаграммы
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'documentation', 'architecture'),
      serveRoot: '/docs/architecture',
    }),
    // ADR документация
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'documentation', 'adr'),
      serveRoot: '/docs/adr',
    }),
    // Главная страница документации из src/static (НЕ генерируется!)
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'src', 'static'),
      serveRoot: '/docs',
    }),
    // Angular приложение на корневом пути (но ПОСЛЕ документации)
    ServeStaticModule.forRoot({
      rootPath: join(
        __dirname,
        '..',
        'comersant-frontend',
        'dist',
        'comersant-frontend',
        'browser',
      ),
    }),
    LobbyModule,
    GameModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
