import { Types } from "mongoose";
import { InsertProductPayload, Product } from "../types/db";
import { Context, UpdateProductInput } from "src/types/common";

export const productById = async (
  {
    _id,
  }: {
    _id: string;
  },
  ctx: Context,
): Promise<Product> => {
  const product = await ctx.models.productModel.getProductById(_id);
  return product;
};

export const productByProducerId = async (
  {
    producerId,
  }: {
    producerId: string;
  },
  ctx: Context,
): Promise<Product[]> => {
  const products = await ctx.models.productModel.getProductsByFilter({
    producerId: { _id: new Types.ObjectId(producerId) },
  });
  return products;
};

export const removeProductsByIds = async (
  {
    ids,
  }: {
    ids: string[];
  },
  ctx: Context,
): Promise<void> => {
  await ctx.models.productModel.removeProducts(ids);
};

export const addProducts = async (
  { products }: { products: InsertProductPayload[] },
  ctx: Context,
) => {
  const presentProducers = await ctx.models.producerModel.findProducersByFilter(
    { _id: { $in: products.map((el) => el.producerId) } },
  );
  const productsMissingProducer = products.filter(
    ({ producerId }) =>
      !presentProducers.some(({ _id }) => producerId === _id.toString()),
  );
  if (productsMissingProducer.length) {
    throw new Error(
      `product(s) provided is pointing to producerId that is not present: ${JSON.stringify(productsMissingProducer)}`,
    );
  }
  return await ctx.models.productModel.insetrProducts(products);
};

export const updateProduct = async (
  { _id, ...rest }: UpdateProductInput,
  ctx: Context,
) => {
  if (rest.producerId) {
    const presentProducer = await ctx.models.producerModel.getProducerById(
      rest.producerId,
    );
    if (!presentProducer) {
      throw new Error(
        `Attempt to change products producer to one that is not present. Producer id:${rest.producerId}`,
      );
    }
  }
  return await ctx.models.productModel.updateProductByFilter({
    update: rest,
    filter: { _id: _id },
    options: { new: true },
  });
};
