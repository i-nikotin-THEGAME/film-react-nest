import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FilmDocument } from '../films/schemas/film.schema';
import { FilmDto, FilmScheduleDto, ShowDto } from '../films/dto/films.dto';

@Injectable()
export class FilmsRepository {
  private readonly logger = new Logger(FilmsRepository.name);

  constructor(@InjectModel('Film') private filmModel: Model<FilmDocument>) {}

  async findAll(): Promise<FilmDto[]> {
    this.logger.debug('Загрузка всех фильмов из БД');
    try {
      const docs = await this.filmModel.find().lean().exec();
      this.logger.verbose(`Найдено ${docs.length} фильмов в БД`);
      return docs.map((d) => this.toFilmDto(d));
    } catch (error) {
      this.logger.error(
        `Ошибка при загрузке всех фильмов: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findById(id: string): Promise<FilmDto | null> {
    this.logger.debug(`Загрузка фильма по ID: ${id}`);
    try {
      const doc = await this.filmModel.findOne({ id }).lean().exec();
      if (doc) {
        this.logger.verbose(`Фильм найден: ${id}`);
        return this.toFilmDto(doc);
      } else {
        this.logger.warn(`Фильм не найден: ${id}`);
        return null;
      }
    } catch (error) {
      this.logger.error(
        `Ошибка при загрузке фильма ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findSchedule(id: string): Promise<FilmScheduleDto | null> {
    this.logger.debug(`Загрузка расписания для фильма: ${id}`);
    try {
      const doc = await this.filmModel.findOne({ id }).lean().exec();
      if (!doc) {
        this.logger.warn(`Расписание не найдено: фильм ${id} не существует`);
        return null;
      }
      const showings: ShowDto[] = (doc.schedule || []).map((s: any) => ({
        id: s.id,
        daytime: s.daytime,
        hall: s.hall,
        rows: s.rows,
        seats: s.seats,
        price: s.price,
        taken: s.taken || [],
      }));

      this.logger.verbose(
        `Расписание найдено для фильма ${id} с ${showings.length} сеансами`,
      );
      return {
        filmId: doc.id,
        showings,
      };
    } catch (error) {
      this.logger.error(
        `Ошибка при загрузке расписания для фильма ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async create(f: Partial<FilmDto>) {
    this.logger.debug(`Создание нового фильма: ${f.title}`);
    try {
      const created = await this.filmModel.create(f as any);
      this.logger.log(`Фильм успешно создан: ${created.id}`);
      return this.toFilmDto(created.toObject());
    } catch (error) {
      this.logger.error(
        `Ошибка при создании фильма: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Попытка зарезервировать места: atomically loads документ, проверяет, не заняты ли места,
   * и добавляет новые ключи в поле showings[i].taken, затем сохраняет документ.
   * Бросает ошибку, если хотя бы одно место уже занято.
   */
  async reserveSeats(
    filmId: string,
    daytime: string,
    seatKeys: string[],
  ): Promise<void> {
    this.logger.debug(
      `Попытка зарезервировать ${seatKeys.length} мест для фильма ${filmId} на ${daytime}`,
    );
    try {
      const doc = await this.filmModel.findOne({ id: filmId }).exec();
      if (!doc) {
        this.logger.warn(`Фильм не найден для резервирования: ${filmId}`);
        throw new Error('Film not found');
      }

      const showing = doc.schedule.find((s: any) => s.daytime === daytime);
      if (!showing) {
        this.logger.warn(`Сеанс не найден для фильма ${filmId} на ${daytime}`);
        throw new Error('Showing not found');
      }

      showing.taken = showing.taken || [];

      // Проверяем пересечение
      const already = seatKeys.filter((k) => showing.taken.includes(k));
      if (already.length > 0) {
        this.logger.warn(
          `Места уже заняты для фильма ${filmId}: ${already.join(', ')}`,
        );
        throw new Error('Seats already taken');
      }

      // Добавляем новые занятые места
      showing.taken.push(...seatKeys);
      await doc.save();
      this.logger.verbose(
        `Места успешно зарезервированы для фильма ${filmId}: ${seatKeys.join(', ')}`,
      );
    } catch (error) {
      this.logger.error(
        `Ошибка при резервировании мест для фильма ${filmId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
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
