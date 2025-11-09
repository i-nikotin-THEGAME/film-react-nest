import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';

import { configProvider } from './app.config.provider';
import { MongooseModule } from '@nestjs/mongoose';
import { FilmSchema } from './films/schemas/film.schema';
import { FilmsController } from './films/films.controller';
import { FilmsService } from './films/films.service';
import { FilmsRepository } from './repository/films.repository';
import { OrderController } from './order/order.controller';
import { OrderService } from './order/order.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [
        () => ({
          database: {
            driver: process.env.DATABASE_DRIVER || 'mongodb',
            url:
              process.env.DATABASE_URL || 'mongodb://localhost:27017/practicum',
          },
        }),
      ],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('database.url'),
      }),
    }),
    MongooseModule.forFeature([{ name: 'Film', schema: FilmSchema }]),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public', 'content', 'afisha'),
      serveRoot: '/content/afisha',
      serveStaticOptions: {
        index: false,
        extensions: ['jpg', 'jpeg', 'png', 'gif'],
        setHeaders: (res, path) => {
          if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
            res.setHeader('Content-Type', 'image/jpeg');
          } else if (path.endsWith('.png')) {
            res.setHeader('Content-Type', 'image/png');
          } else if (path.endsWith('.gif')) {
            res.setHeader('Content-Type', 'image/gif');
          }
        },
        fallthrough: false,
      },
    }),
  ],
  controllers: [FilmsController, OrderController],
  providers: [configProvider, FilmsService, OrderService, FilmsRepository],
})
export class AppModule {}
