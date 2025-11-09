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
    const docs = await this.filmModel.find().lean().exec();
    return docs.map((d) => this.toFilmDto(d));
  }

  async findById(id: string): Promise<FilmDto | null> {
    const doc = await this.filmModel.findOne({ id }).lean().exec();
    return doc ? this.toFilmDto(doc) : null;
  }

  async findSchedule(id: string): Promise<FilmScheduleDto | null> {
    const doc = await this.filmModel.findOne({ id }).lean().exec();
    if (!doc) return null;
    const showings: ShowDto[] = (doc.schedule || []).map((s: any) => ({
      id: s.id,
      daytime: s.daytime,
      hall: s.hall,
      rows: s.rows,
      seats: s.seats,
      price: s.price,
      taken: s.taken || [],
    }));

    return {
      filmId: doc.id,
      showings,
    };
  }

  async create(f: Partial<FilmDto>) {
    const created = await this.filmModel.create(f as any);
    return this.toFilmDto(created.toObject());
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
    const doc = await this.filmModel.findOne({ id: filmId }).exec();
    if (!doc) throw new Error('Film not found');

    const showing = doc.schedule.find((s: any) => s.daytime === daytime);
    if (!showing) throw new Error('Showing not found');

    showing.taken = showing.taken || [];

    // Проверяем пересечение
    const already = seatKeys.filter((k) => showing.taken.includes(k));
    if (already.length > 0) {
      throw new Error('Seats already taken');
    }

    // Добавляем новые занятые места
    showing.taken.push(...seatKeys);
    await doc.save();
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
