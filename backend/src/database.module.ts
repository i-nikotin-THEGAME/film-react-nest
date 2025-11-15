import { Module, DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import { Film } from './films/film.entity';
import { Schedule } from './order/schedule.entity';
import { FilmSchema } from './films/schemas/film.schema';
import { FilmsRepository } from './repository/films.repository';
import { TypeORMFilmsRepository } from './repository/typeorm.film.repository';

// Загрузить .env при импорте модуля
dotenv.config();

@Module({})
export class DatabaseModule {
  static forRoot(): DynamicModule {
    const driver = process.env.DATABASE_DRIVER || 'mongodb';
    const isPostgres = driver === 'postgres';

    const databaseModules = isPostgres
      ? this.getTypeORMModules()
      : this.getMongooseModules();

    const providers = isPostgres
      ? [
          TypeORMFilmsRepository,
          { provide: FilmsRepository, useClass: TypeORMFilmsRepository },
        ]
      : [FilmsRepository];

    return {
      module: DatabaseModule,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          cache: true,
        }),
        ...databaseModules,
      ],
      providers,
      exports: [
        FilmsRepository,
        ...(isPostgres ? [TypeOrmModule] : [MongooseModule]),
      ],
    };
  }

  private static getTypeORMModules(): any[] {
    return [
      TypeOrmModule.forRootAsync({
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          type: 'postgres',
          host: configService.get('POSTGRES_HOST') || 'localhost',
          port: parseInt(configService.get('POSTGRES_PORT') || '5432'),
          username: configService.get('POSTGRES_USERNAME'),
          password: configService.get('POSTGRES_PASSWORD'),
          database: configService.get('POSTGRES_DATABASE') || 'prac',
          entities: [Film, Schedule],
          synchronize: false,
        }),
        inject: [ConfigService],
      }),
      TypeOrmModule.forFeature([Film, Schedule]),
    ];
  }

  private static getMongooseModules(): any[] {
    return [
      MongooseModule.forRootAsync({
        useFactory: () => ({
          uri: process.env.MONGODB_URL || 'mongodb://localhost:27017/practicum',
        }),
      }),
      MongooseModule.forFeature([{ name: 'Film', schema: FilmSchema }]),
    ];
  }
}
