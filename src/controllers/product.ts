import { Types } from "mongoose";
import {
  getProductById,
  getProductsByFilter,
  insetrProducts,
  removeProducts,
  updateProductByFilter,
} from "../models/product";
import { InsertProductPayload, Product } from "../types/db";
import { findProducersByFilter, findProducersByNames, getProducerById } from "../models/producer";
import { UpdateProductInput } from "src/types/common";

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

export const removeProductsByIds = async ({
  ids,
}: {
  ids: string[];
}): Promise<void> => {
  await removeProducts(ids);
};

export const addProducts = async ({ products }: { products: InsertProductPayload[] }) => {
  const presentProducers = await findProducersByFilter(
    { _id: { $in: products.map((el) => el.producerId) } }
  );
  const productsMissingProducer = products.filter(({ producerId }) =>
    !presentProducers.some(({ _id }) => producerId === _id.toString()),
  );
  if (productsMissingProducer.length) {
    throw new Error(
      `product(s) provided is pointing to producerId that is not present: ${JSON.stringify(productsMissingProducer)}`,
    );
  }
  return await insetrProducts(products);
};

export const updateProduct = async ({ _id, ...rest }: UpdateProductInput) => {
  if (rest.producerId) {
    const presentProducer = await getProducerById(rest.producerId);
    if (!presentProducer) {
      throw new Error(
        `Attempt to change products producer to one thet is not present. Producer id:${rest.producerId}`,
      );
    }
  }
  return await updateProductByFilter({
    update: rest,
    filter: { _id: _id },
    options: { new: true },
  });
};
