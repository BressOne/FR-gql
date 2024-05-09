import { InsertProductPayload } from "./db";

export type UpdateProductInput = Partial<InsertProductPayload> & {
  _id: string;
};
