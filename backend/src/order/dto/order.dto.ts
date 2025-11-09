export enum OrderStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  Cancelled = 'cancelled',
}

export class SeatDto {
  readonly row: number;
  readonly seat: number;
}

export class CustomerDto {
  readonly name: string;
  readonly email: string;
  readonly phone?: string;
}

export class TicketDto {
  readonly film: string;
  readonly session: string;
  readonly daytime: string;
  readonly row: number;
  readonly seat: number;
  readonly price: number;
  readonly id: string;
}

export class OrderDto {
  readonly total: number;
  readonly items: TicketDto[];
}
