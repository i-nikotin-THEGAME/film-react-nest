import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
      throw new BadRequestException('Не указаны билеты для бронирования');
    }
    for (const ticket of tickets) {
      if (!ticket.film || !ticket.session || !ticket.daytime) {
        throw new BadRequestException('Не указан фильм, сеанс или время');
      }
      if (ticket.row == null || ticket.seat == null || ticket.price == null) {
        throw new BadRequestException('Неправильный формат места или цены');
      }
      if (ticket.row < 1 || ticket.seat < 1) {
        throw new BadRequestException('Некорректные координаты места');
      }
    }
  }

  async create(tickets: any[]): Promise<OrderDto> {
    // Базовая валидация формата
    await this.validateTickets(tickets);

    // Проходим по каждому билету и пытаемся зарезервировать места
    try {
      const ticketPromises = tickets.map(async (ticket) => {
        const seatKey = generateSeatKey(ticket.row, ticket.seat);
        await this.filmsRepository.reserveSeats(ticket.film, ticket.daytime, [
          seatKey,
        ]);
      });

      await Promise.all(ticketPromises);
      const reservedTickets = tickets.map((ticket) => ({
        ...ticket,
        id: randomUUID(),
      }));
      const order: OrderDto = {
        total: reservedTickets.length,
        items: reservedTickets,
      };

      this.orders.push(order);
      return order;
    } catch (e: any) {
      if (e?.message?.includes('Seats already taken')) {
        throw new BadRequestException('Одно или несколько мест уже заняты');
      }
      if (e?.message?.includes('Showing not found')) {
        throw new NotFoundException('Сеанс не найден');
      }
      if (e?.message?.includes('Film not found')) {
        throw new NotFoundException('Фильм не найден');
      }
      throw e;
    }
  }
}
