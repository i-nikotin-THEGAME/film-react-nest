import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Film } from '../films/film.entity';

@Entity('schedules')
export class Schedule {
  @PrimaryColumn()
  id: string;

  @Column()
  filmId: string;

  @Column()
  daytime: string;

  @Column()
  hall: number;

  @Column()
  rows: number;

  @Column()
  seats: number;

  @Column()
  price: number;

  @Column()
  taken: string;

  @ManyToOne(() => Film, (film) => film.schedules)
  @JoinColumn({ name: 'filmId' })
  film: Film;
}
