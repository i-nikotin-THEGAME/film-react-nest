import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { OrderDto } from './dto/order.dto';
import { FilmsRepository } from '../repository/films.repository';
import { generateSeatKey } from '../films/interfaces/seat.interface';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);
  private readonly orders: OrderDto[] = [];

  constructor(private readonly filmsRepository: FilmsRepository) {}

  /**
   * Проверяем, что сеанс доступен и места валидны.
   * Основная проверка на занятость выполняется в FilmsRepository.reserveSeats,
   * здесь делаем только базовую валидацию формата.
   */
  private async validateTickets(tickets: any[]): Promise<void> {
    this.logger.debug(`Валидация ${tickets?.length || 0} билетов`);
    // проверка на базовую корректность перед попыткой резерва
    if (!tickets || tickets.length === 0) {
      this.logger.warn('Билеты для валидации не предоставлены');
      throw new BadRequestException({
        error: 'Не указаны билеты для бронирования',
      });
    }
    for (const ticket of tickets) {
      if (!ticket.film || !ticket.session || !ticket.daytime) {
        this.logger.warn(
          `Некорректные данные билета: отсутствует фильм, сеанс или время`,
        );
        throw new BadRequestException({
          error: 'Не указан фильм, сеанс или время',
        });
      }
      if (ticket.row == null || ticket.seat == null || ticket.price == null) {
        this.logger.warn(
          `Некорректные данные билета: отсутствует ряд, место или цена`,
        );
        throw new BadRequestException({
          error: 'Неправильный формат места или цены',
        });
      }
      if (ticket.row < 1 || ticket.seat < 1) {
        this.logger.warn(
          `Некорректные координаты места: ряд=${ticket.row}, место=${ticket.seat}`,
        );
        throw new BadRequestException({
          error: 'Некорректные координаты места',
        });
      }
    }
    this.logger.debug('Все билеты успешно валидированы');
  }

  async create(tickets: any[]): Promise<OrderDto> {
    this.logger.log(
      `Начало процесса создания заказа с ${tickets?.length || 0} билетами`,
    );
    try {
      // Базовая валидация формата
      await this.validateTickets(tickets);

      const reservedTickets = [];
      const errors: string[] = [];

      // Обрабатываем билеты ПОСЛЕДОВАТЕЛЬНО
      for (const ticket of tickets) {
        try {
          this.logger.debug(
            `Обработка билета: фильм=${ticket.film}, ряд=${ticket.row}, место=${ticket.seat}`,
          );
          const seatKey = generateSeatKey(ticket.row, ticket.seat);
          await this.filmsRepository.reserveSeats(ticket.film, ticket.daytime, [
            seatKey,
          ]);

          const ticketWithId = {
            ...ticket,
            id: randomUUID(),
          };
          reservedTickets.push(ticketWithId);
          this.logger.verbose(
            `Билет успешно забронирован: id=${ticketWithId.id}`,
          );
        } catch (e: any) {
          this.logger.warn(
            `Ошибка при бронировании билета на ряд ${ticket.row}, место ${ticket.seat}: ${e.message}`,
          );
          if (e?.message?.includes('Seats already taken')) {
            errors.push(`Место ${ticket.row}:${ticket.seat} уже занято`);
          } else if (e?.message?.includes('Showing not found')) {
            errors.push(`Сеанс не найден`);
          } else if (e?.message?.includes('Film not found')) {
            errors.push(`Фильм не найден`);
          } else {
            errors.push(`Ошибка бронирования: ${e.message}`);
          }
        }
      }

      // Если есть ошибки - бросаем исключение
      if (errors.length > 0) {
        this.logger.error(`Ошибка при создании заказа: ${errors.join(', ')}`);
        throw new BadRequestException({
          error: errors.join(', '),
        });
      }

      // Если ничего не забронировали
      if (reservedTickets.length === 0) {
        this.logger.error('Билеты не были забронированы');
        throw new BadRequestException({
          error: 'Не удалось забронировать ни одного места',
        });
      }

      const order: OrderDto = {
        total: reservedTickets.length,
        items: reservedTickets,
      };

      this.orders.push(order);
      this.logger.log(`Заказ успешно создан: всего=${order.total} билетов`);
      return order;
    } catch (e: any) {
      this.logger.error(
        `Исключение при создании заказа: ${e.message}`,
        e.stack,
      );
      throw e;
    }
  }
}
