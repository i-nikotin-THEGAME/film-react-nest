export class ShowDto {
  readonly id: string;
  readonly daytime: string;
  readonly hall: number;
  readonly rows: number;
  readonly seats: number;
  readonly price: number;
  readonly taken: string[];
}

export class FilmDto {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly about: string;
  readonly tags: string[];
  readonly image: string;
  readonly cover: string;
  readonly rating: number;
  readonly director: string;
}

export class FilmScheduleDto {
  readonly filmId: string;
  readonly showings: ShowDto[];
}
