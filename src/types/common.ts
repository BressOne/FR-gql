import { Models } from "../models";
import { InsertProductPayload } from "./db";

export type UpdateProductInput = Partial<InsertProductPayload> & {
  _id: string;
};

export type Context = {
  models: Models;
};
