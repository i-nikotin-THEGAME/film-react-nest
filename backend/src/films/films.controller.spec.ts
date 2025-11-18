import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { FilmsController } from './films.controller';
import { FilmsService } from './films.service';
import { FilmDto, ShowDto } from './dto/films.dto';

describe('FilmsController', () => {
  let controller: FilmsController;
  let filmsService: jest.Mocked<FilmsService>;

  const mockFilmDto: FilmDto = {
    id: 'film-1',
    title: 'Test Film',
    description: 'Test Description',
    about: 'About',
    tags: ['tag1', 'tag2'],
    image: 'image.jpg',
    cover: 'cover.jpg',
    rating: 8.5,
    director: 'Director Name',
  };

  const mockShowDto: ShowDto = {
    id: 'show-1',
    daytime: '2025-11-16T19:00:00Z',
    hall: 1,
    rows: 10,
    seats: 20,
    price: 250,
    taken: [],
  };

  beforeEach(async () => {
    const mockFilmsService = {
      findAll: jest.fn(),
      findSchedule: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilmsController],
      providers: [
        {
          provide: FilmsService,
          useValue: mockFilmsService,
        },
      ],
    }).compile();

    controller = module.get<FilmsController>(FilmsController);
    filmsService = module.get(FilmsService) as jest.Mocked<FilmsService>;
  });

  describe('findAll', () => {
    it('should return an array of films with total count', async () => {
      const mockFilms = [mockFilmDto];
      filmsService.findAll.mockResolvedValue(mockFilms);

      const result = await controller.findAll();

      expect(result).toEqual({
        total: 1,
        items: mockFilms,
      });
      expect(filmsService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no films found', async () => {
      filmsService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual({
        total: 0,
        items: [],
      });
    });

    it('should handle service errors', async () => {
      const error = new Error('Database error');
      filmsService.findAll.mockRejectedValue(error);

      await expect(controller.findAll()).rejects.toThrow('Database error');
    });

    it('should log when fetching films', async () => {
      filmsService.findAll.mockResolvedValue([mockFilmDto]);
      const loggerSpy = jest
        .spyOn(Logger.prototype, 'log')
        .mockImplementation();

      await controller.findAll();

      expect(loggerSpy).toHaveBeenCalledWith('Получение всех фильмов');
      loggerSpy.mockRestore();
    });

    it('should log debug information after fetching films', async () => {
      const mockFilms = [mockFilmDto, mockFilmDto];
      filmsService.findAll.mockResolvedValue(mockFilms);
      const debugSpy = jest
        .spyOn(Logger.prototype, 'debug')
        .mockImplementation();

      await controller.findAll();

      expect(debugSpy).toHaveBeenCalledWith('Получено 2 фильмов');
      debugSpy.mockRestore();
    });

    it('should log error on failure', async () => {
      const error = new Error('Test error');
      filmsService.findAll.mockRejectedValue(error);
      const errorSpy = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation();

      try {
        await controller.findAll();
      } catch {
        // Expected to throw
      }

      expect(errorSpy).toHaveBeenCalled();
      errorSpy.mockRestore();
    });
  });

  describe('findSchedule', () => {
    it('should return schedule for a specific film', async () => {
      const mockSchedule = {
        filmId: 'film-1',
        showings: [mockShowDto],
      };
      filmsService.findSchedule.mockResolvedValue(mockSchedule);

      const result = await controller.findSchedule('film-1');

      expect(result).toEqual({
        total: 1,
        items: mockSchedule.showings,
      });
      expect(filmsService.findSchedule).toHaveBeenCalledWith('film-1');
    });

    it('should return empty items when schedule not found', async () => {
      filmsService.findSchedule.mockResolvedValue({
        filmId: 'film-1',
        showings: [],
      });

      const result = await controller.findSchedule('film-1');

      expect(result).toEqual({
        total: 0,
        items: [],
      });
    });

    it('should handle invalid film ID gracefully', async () => {
      const result = await controller.findSchedule('/');

      expect(result).toEqual({
        total: 0,
        items: [],
      });
    });

    it('should handle empty film ID', async () => {
      const result = await controller.findSchedule('');

      expect(result).toEqual({
        total: 0,
        items: [],
      });
    });

    it('should log film ID when fetching schedule', async () => {
      const loggerSpy = jest
        .spyOn(Logger.prototype, 'log')
        .mockImplementation();
      filmsService.findSchedule.mockResolvedValue({
        filmId: 'film-1',
        showings: [],
      });

      await controller.findSchedule('film-1');

      expect(loggerSpy).toHaveBeenCalledWith(
        'Получение расписания для фильма: film-1',
      );
      loggerSpy.mockRestore();
    });

    it('should log debug info with showing count', async () => {
      const debugSpy = jest
        .spyOn(Logger.prototype, 'debug')
        .mockImplementation();
      filmsService.findSchedule.mockResolvedValue({
        filmId: 'film-1',
        showings: [mockShowDto, mockShowDto],
      });

      await controller.findSchedule('film-1');

      expect(debugSpy).toHaveBeenCalledWith('Получено расписание с 2 сеансами');
      debugSpy.mockRestore();
    });

    it('should handle service errors when fetching schedule', async () => {
      const error = new Error('Service error');
      filmsService.findSchedule.mockRejectedValue(error);

      await expect(controller.findSchedule('film-1')).rejects.toThrow(
        'Service error',
      );
    });

    it('should return multiple shows', async () => {
      const mockShows = [mockShowDto, mockShowDto, mockShowDto];
      filmsService.findSchedule.mockResolvedValue({
        filmId: 'film-1',
        showings: mockShows,
      });

      const result = await controller.findSchedule('film-1');

      expect(result.total).toBe(3);
      expect(result.items).toHaveLength(3);
    });
  });

  describe('Controller initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have FilmsService injected', () => {
      expect(filmsService).toBeDefined();
    });
  });
});
