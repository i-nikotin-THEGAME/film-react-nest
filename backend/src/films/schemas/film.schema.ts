import { Schema, Document } from 'mongoose';

export const SeatSchema = new Schema(
  {
    row: { type: Number },
    seat: { type: Number },
  },
  { _id: false },
);

export const ShowSchema = new Schema(
  {
    id: { type: String, required: true },
    daytime: { type: String, required: true },
    hall: { type: Number, required: true },
    rows: { type: Number, required: true },
    seats: { type: Number, required: true },
    price: { type: Number, required: true },
    taken: { type: [String], default: [] },
  },
  { _id: false },
);

export const FilmSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String },
    about: { type: String },
    rating: { type: Number },
    director: { type: String },
    tags: { type: [String], default: [] },
    image: { type: String },
    cover: { type: String },
    schedule: { type: [ShowSchema], default: [] },
  },
  { timestamps: false },
);

export interface FilmDocument extends Document {
  id: string;
  title: string;
  description?: string;
  about?: string;
  rating?: number;
  director?: string;
  tags: string[];
  image?: string;
  cover?: string;
  schedule: Array<{
    id: string;
    daytime: string;
    hall: number;
    rows: number;
    seats: number;
    price: number;
    taken: string[];
  }>;
}
