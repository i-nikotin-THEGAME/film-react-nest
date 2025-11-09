import { Controller, Get, Param } from '@nestjs/common';
import { FilmsService } from './films.service';
import { FilmDto, ShowDto } from './dto/films.dto';

@Controller('films')
export class FilmsController {
  constructor(private readonly filmsService: FilmsService) {}

  @Get()
  async findAll(): Promise<{ total: number; items: FilmDto[] }> {
    const films = await this.filmsService.findAll();
    return {
      total: films.length,
      items: films,
    };
  }

  @Get(':id/schedule')
  async findSchedule(
    @Param('id') id: string,
  ): Promise<{ total: number; items: ShowDto[] }> {
    if (!id || id === '/') {
      return { total: 0, items: [] };
    }
    const schedule = await this.filmsService.findSchedule(id);
    return {
      total: schedule.showings.length,
      items: schedule.showings,
    };
  }
}
