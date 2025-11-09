import { Controller, Post, Body } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderDto } from './dto/order.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(@Body() body: { tickets: any[] }): Promise<OrderDto> {
    const { tickets } = body;
    return this.orderService.create(tickets);
  }
}
