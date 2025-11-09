import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { OrderDto } from './dto/order.dto';
import { FilmsRepository } from '../repository/films.repository';
import { generateSeatKey } from '../films/interfaces/seat.interface';

@Injectable()
export class OrderService {
  private readonly orders: OrderDto[] = [];

  constructor(private readonly filmsRepository: FilmsRepository) {}

  /**
   * Проверяем, что сеанс доступен и места валидны.
   * Основная проверка на занятость выполняется в FilmsRepository.reserveSeats,
   * здесь делаем только базовую валидацию формата.
   */
  private async validateTickets(tickets: any[]): Promise<void> {
    // проверка на базовую корректность перед попыткой резерва
    if (!tickets || tickets.length === 0) {
      throw new BadRequestException({
        error: 'Не указаны билеты для бронирования',
      });
    }
    for (const ticket of tickets) {
      if (!ticket.film || !ticket.session || !ticket.daytime) {
        throw new BadRequestException({
          error: 'Не указан фильм, сеанс или время',
        });
      }
      if (ticket.row == null || ticket.seat == null || ticket.price == null) {
        throw new BadRequestException({
          error: 'Неправильный формат места или цены',
        });
      }
      if (ticket.row < 1 || ticket.seat < 1) {
        throw new BadRequestException({
          error: 'Некорректные координаты места',
        });
      }
    }
  }

  async create(tickets: any[]): Promise<OrderDto> {
    try {
      // Базовая валидация формата
      await this.validateTickets(tickets);

      const reservedTickets = [];
      const errors: string[] = [];

      // Обрабатываем билеты ПОСЛЕДОВАТЕЛЬНО
      for (const ticket of tickets) {
        try {
          const seatKey = generateSeatKey(ticket.row, ticket.seat);
          await this.filmsRepository.reserveSeats(ticket.film, ticket.daytime, [
            seatKey,
          ]);

          reservedTickets.push({
            ...ticket,
            id: randomUUID(),
          });
        } catch (e: any) {
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
        throw new BadRequestException({
          error: errors.join(', '),
        });
      }

      // Если ничего не забронировали
      if (reservedTickets.length === 0) {
        throw new BadRequestException({
          error: 'Не удалось забронировать ни одного места',
        });
      }

      const order: OrderDto = {
        total: reservedTickets.length,
        items: reservedTickets,
      };

      this.orders.push(order);
      return order;
    } catch (e: any) {
      throw e;
    }
  }
}
