import { Injectable, Logger } from '@nestjs/common';
import { FilmDto, FilmScheduleDto } from './dto/films.dto';
import { FilmsRepository } from '../repository/films.repository';

@Injectable()
export class FilmsService {
  private readonly logger = new Logger(FilmsService.name);

  constructor(private readonly filmsRepository: FilmsRepository) {}

  async findAll(): Promise<FilmDto[]> {
    this.logger.debug('Загрузка всех фильмов из репозитория');
    try {
      const films = await this.filmsRepository.findAll();
      this.logger.verbose(`Успешно загружено ${films.length} фильмов`);
      return films;
    } catch (error) {
      this.logger.error(
        `Ошибка при загрузке фильмов: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findSchedule(id: string): Promise<FilmScheduleDto> {
    this.logger.debug(`Загрузка расписания для фильма с ID: ${id}`);
    try {
      const schedule = await this.filmsRepository.findSchedule(id);
      if (!schedule) {
        this.logger.warn(`Расписание не найдено для фильма с ID: ${id}`);
        return { filmId: id, showings: [] } as FilmScheduleDto;
      }
      this.logger.verbose(
        `Успешно загружено расписание с ${schedule.showings.length} сеансами`,
      );
      return schedule;
    } catch (error) {
      this.logger.error(
        `Ошибка при загрузке расписания для фильма ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
