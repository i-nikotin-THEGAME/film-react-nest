import { Controller, Post, Body, Logger } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderDto } from './dto/order.dto';

@Controller('order')
export class OrderController {
  private readonly logger = new Logger(OrderController.name);

  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(@Body() body: { tickets: any[] }): Promise<OrderDto> {
    const { tickets } = body;
    this.logger.log(`Создание заказа с ${tickets?.length || 0} билетами`);
    try {
      const order = await this.orderService.create(tickets);
      this.logger.debug(`Заказ успешно создан с ${order.total} позициями`);
      return order;
    } catch (error) {
      this.logger.error(
        `Ошибка при создании заказа: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
