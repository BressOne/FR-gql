import { Types } from "mongoose";
import { getProductById, getProductsByFilter } from "../models/product";
import { Product } from "../types/db";

export const productById = async ({
  _id,
}: {
  _id: string;
}): Promise<Product> => {
  const product = await getProductById(_id);
  return product;
};

export const productByProducerId = async ({
  producerId,
}: {
  producerId: string;
}): Promise<Product[]> => {
  const products = await getProductsByFilter({
    producerId: { _id: new Types.ObjectId(producerId) },
  });
  return products;
};
