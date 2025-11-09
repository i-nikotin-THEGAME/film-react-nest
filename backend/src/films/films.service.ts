import { Injectable } from '@nestjs/common';
import { FilmDto, FilmScheduleDto } from './dto/films.dto';
import { FilmsRepository } from '../repository/films.repository';

@Injectable()
export class FilmsService {
  constructor(private readonly filmsRepository: FilmsRepository) {}

  async findAll(): Promise<FilmDto[]> {
    return this.filmsRepository.findAll();
  }

  async findSchedule(id: string): Promise<FilmScheduleDto> {
    const schedule = await this.filmsRepository.findSchedule(id);
    if (!schedule) {
      return { filmId: id, showings: [] } as FilmScheduleDto;
    }
    return schedule;
  }
}
