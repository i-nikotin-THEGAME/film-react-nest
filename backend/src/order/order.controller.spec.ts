import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, Logger } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderDto, TicketDto } from './dto/order.dto';

describe('OrderController', () => {
  let controller: OrderController;
  let orderService: jest.Mocked<OrderService>;

  const mockTicketDto: TicketDto = {
    film: 'film-1',
    session: 'session-1',
    daytime: '2025-11-16T19:00:00Z',
    row: 5,
    seat: 10,
    price: 250,
    id: 'ticket-1',
  };

  const mockOrderDto: OrderDto = {
    total: 1,
    items: [mockTicketDto],
  };

  beforeEach(async () => {
    const mockOrderService = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: mockOrderService,
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    orderService = module.get(OrderService) as jest.Mocked<OrderService>;
  });

  describe('create', () => {
    it('should create an order with valid tickets', async () => {
      orderService.create.mockResolvedValue(mockOrderDto);

      const result = await controller.create({ tickets: [mockTicketDto] });

      expect(result).toEqual(mockOrderDto);
      expect(orderService.create).toHaveBeenCalledWith([mockTicketDto]);
      expect(orderService.create).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple tickets in a single order', async () => {
      const multiTicketOrder: OrderDto = {
        total: 3,
        items: [mockTicketDto, mockTicketDto, mockTicketDto],
      };
      orderService.create.mockResolvedValue(multiTicketOrder);

      const result = await controller.create({
        tickets: [mockTicketDto, mockTicketDto, mockTicketDto],
      });

      expect(result.total).toBe(3);
      expect(result.items).toHaveLength(3);
    });

    it('should handle empty tickets array', async () => {
      const error = new BadRequestException(
        'Не указаны билеты для бронирования',
      );
      orderService.create.mockRejectedValue(error);

      await expect(controller.create({ tickets: [] })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should log order creation with ticket count', async () => {
      orderService.create.mockResolvedValue(mockOrderDto);
      const loggerSpy = jest
        .spyOn(Logger.prototype, 'log')
        .mockImplementation();

      await controller.create({ tickets: [mockTicketDto] });

      expect(loggerSpy).toHaveBeenCalledWith('Создание заказа с 1 билетами');
      loggerSpy.mockRestore();
    });

    it('should log when tickets count is 0', async () => {
      const loggerSpy = jest
        .spyOn(Logger.prototype, 'log')
        .mockImplementation();
      orderService.create.mockRejectedValue(new Error('No tickets'));

      try {
        await controller.create({ tickets: [] });
      } catch {
        // Expected to throw
      }

      expect(loggerSpy).toHaveBeenCalledWith('Создание заказа с 0 билетами');
      loggerSpy.mockRestore();
    });

    it('should log debug info with order total', async () => {
      orderService.create.mockResolvedValue(mockOrderDto);
      const debugSpy = jest
        .spyOn(Logger.prototype, 'debug')
        .mockImplementation();

      await controller.create({ tickets: [mockTicketDto] });

      expect(debugSpy).toHaveBeenCalledWith(
        'Заказ успешно создан с 1 позициями',
      );
      debugSpy.mockRestore();
    });

    it('should log error when order creation fails', async () => {
      const error = new BadRequestException('Order failed');
      orderService.create.mockRejectedValue(error);
      const errorSpy = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation();

      try {
        await controller.create({ tickets: [mockTicketDto] });
      } catch {
        // Expected to throw
      }

      expect(errorSpy).toHaveBeenCalled();
      errorSpy.mockRestore();
    });

    it('should return order with multiple tickets', async () => {
      const tickets = [
        { ...mockTicketDto, row: 1, seat: 1 },
        { ...mockTicketDto, row: 2, seat: 2 },
      ];
      const multiOrderDto: OrderDto = {
        total: 2,
        items: tickets,
      };
      orderService.create.mockResolvedValue(multiOrderDto);

      const result = await controller.create({ tickets });

      expect(result.total).toBe(2);
      expect(result.items).toHaveLength(2);
    });

    it('should propagate service errors', async () => {
      const error = new BadRequestException('Invalid seat');
      orderService.create.mockRejectedValue(error);

      await expect(
        controller.create({ tickets: [mockTicketDto] }),
      ).rejects.toEqual(error);
    });

    it('should handle undefined tickets gracefully', async () => {
      const error = new BadRequestException(
        'Не указаны билеты для бронирования',
      );
      orderService.create.mockRejectedValue(error);

      await expect(
        controller.create({ tickets: undefined as any }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should call service with correct parameters', async () => {
      const tickets = [mockTicketDto, mockTicketDto];
      orderService.create.mockResolvedValue({
        total: 2,
        items: tickets,
      });

      await controller.create({ tickets });

      expect(orderService.create).toHaveBeenCalledWith(tickets);
    });
  });

  describe('Controller initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have OrderService injected', () => {
      expect(orderService).toBeDefined();
    });

    it('should create controller with module', () => {
      expect(controller).toBeInstanceOf(OrderController);
    });
  });

  describe('Error handling', () => {
    it('should handle BadRequestException from service', async () => {
      const badRequestError = new BadRequestException({
        error: 'Seats already taken',
      });
      orderService.create.mockRejectedValue(badRequestError);

      await expect(
        controller.create({ tickets: [mockTicketDto] }),
      ).rejects.toEqual(badRequestError);
    });

    it('should handle generic errors from service', async () => {
      const genericError = new Error('Unexpected error');
      orderService.create.mockRejectedValue(genericError);

      await expect(
        controller.create({ tickets: [mockTicketDto] }),
      ).rejects.toEqual(genericError);
    });
  });
});
