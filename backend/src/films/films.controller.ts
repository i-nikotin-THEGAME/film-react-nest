import { Controller, Get, Param, Logger } from '@nestjs/common';
import { FilmsService } from './films.service';
import { FilmDto, ShowDto } from './dto/films.dto';

@Controller('films')
export class FilmsController {
  private readonly logger = new Logger(FilmsController.name);

  constructor(private readonly filmsService: FilmsService) {}

  @Get()
  async findAll(): Promise<{ total: number; items: FilmDto[] }> {
    this.logger.log('Получение всех фильмов');
    try {
      const films = await this.filmsService.findAll();
      this.logger.debug(`Получено ${films.length} фильмов`);
      return {
        total: films.length,
        items: films,
      };
    } catch (error) {
      this.logger.error(
        `Ошибка при получении фильмов: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @Get(':id/schedule')
  async findSchedule(
    @Param('id') id: string,
  ): Promise<{ total: number; items: ShowDto[] }> {
    this.logger.log(`Получение расписания для фильма: ${id}`);
    try {
      if (!id || id === '/') {
        this.logger.warn('Передан некорректный ID фильма');
        return { total: 0, items: [] };
      }
      const schedule = await this.filmsService.findSchedule(id);
      this.logger.debug(
        `Получено расписание с ${schedule.showings.length} сеансами`,
      );
      return {
        total: schedule.showings.length,
        items: schedule.showings,
      };
    } catch (error) {
      this.logger.error(
        `Ошибка при получении расписания для фильма ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
