import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Film } from '../films/film.entity';
import { Schedule } from '../order/schedule.entity';
import { FilmDto, FilmScheduleDto, ShowDto } from '../films/dto/films.dto';

@Injectable()
export class TypeORMFilmsRepository {
  private readonly logger = new Logger(TypeORMFilmsRepository.name);

  constructor(
    @InjectRepository(Film)
    private readonly filmRepository: Repository<Film>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
  ) {}

  async findAll(): Promise<FilmDto[]> {
    const docs = await this.filmRepository.find({
      relations: ['schedules'],
    });
    return docs.map((d) => this.toFilmDto(d));
  }

  async findById(id: string): Promise<FilmDto | null> {
    const doc = await this.filmRepository.findOne({
      where: { id },
      relations: ['schedules'],
    });
    return doc ? this.toFilmDto(doc) : null;
  }

  async findSchedule(id: string): Promise<FilmScheduleDto | null> {
    const doc = await this.filmRepository.findOne({
      where: { id },
      relations: ['schedules'],
    });
    if (!doc) return null;
    const showings: ShowDto[] = (doc.schedules || []).map((s: any) => ({
      id: s.id,
      daytime: s.daytime,
      hall: s.hall,
      rows: s.rows,
      seats: s.seats,
      price: s.price,
      taken: s.taken ? JSON.parse(s.taken) : [], // преобразуем JSON строку в массив
    }));

    return {
      filmId: doc.id,
      showings,
    };
  }

  async create(f: Partial<FilmDto>) {
    const film = this.filmRepository.create(f as Film);
    const created = await this.filmRepository.save(film);
    return this.toFilmDto(created);
  }

  async reserveSeats(
    filmId: string,
    daytime: string,
    seatKeys: string[],
  ): Promise<void> {
    const doc = await this.filmRepository.findOne({
      where: { id: filmId },
    });
    if (!doc) throw new Error('Film not found');

    const showing = await this.scheduleRepository.findOne({
      where: {
        filmId,
        daytime,
      },
    });
    if (!showing) throw new Error('Showing not found');

    const taken = showing.taken ? (JSON.parse(showing.taken) as string[]) : [];

    // Проверяем пересечение
    const already = seatKeys.filter((k) => taken.includes(k));
    if (already.length > 0) {
      throw new Error('Seats already taken');
    }

    // Добавляем новые занятые места
    taken.push(...seatKeys);
    showing.taken = JSON.stringify(taken);

    await this.scheduleRepository.save(showing);
  }

  private toFilmDto(doc: any): FilmDto {
    return {
      id: doc.id,
      title: doc.title,
      description: doc.description,
      about: doc.about,
      tags: doc.tags || [],
      image: doc.image,
      cover: doc.cover,
      rating: doc.rating,
      director: doc.director,
    };
  }
}
