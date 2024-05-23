import { ObjectId } from "mongoose";

export type ProducerBase = {
  name: string;
  country?: string;
  region?: string;
};

export type Producer = ProducerBase & {
  _id: ObjectId;
};

export type InsertProducerPayload = ProducerBase;

export type ProductBase = {
  vintage: number;
  name: string;
};

export type Product = ProductBase & {
  _id: ObjectId;
  producerId: ObjectId;
};

export type InsertProductPayload = ProductBase & {
  producerId: string;
};
