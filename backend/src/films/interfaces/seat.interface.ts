export interface Seat {
  row: number;
  seat: number;
}

export interface SeatKey {
  filmId: string;
  showDate: string;
  showTime: string;
  seatKey: string;
}

export function generateSeatKey(row: number, seat: number): string {
  return `${row}:${seat}`;
}
