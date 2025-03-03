import { InsertProductPayload, Product } from "../types/db";
import ProductSchema from "../schemas/product";
import mongoose, {
  FilterQuery,
  InsertManyOptions,
  QueryOptions,
} from "mongoose";

const getProductById = async (_id: string) => {
  const objectId = new mongoose.Types.ObjectId(_id);
  return ProductSchema.findOne<Product>({ _id: objectId });
};

const getProductsByFilter = async (filter: FilterQuery<Product>) =>
  ProductSchema.find<Product>(filter);

const insetrProducts = async (
  productsToInsert: InsertProductPayload[],
  options?: InsertManyOptions,
) => ProductSchema.insertMany(productsToInsert, options);

const bulWriteProducts = async (productsToInsert: InsertProductPayload[]) =>
  ProductSchema.bulkWrite(
    productsToInsert.map((el) => ({
      updateOne: {
        filter: el,
        update: el,
        upsert: true,
      },
    })),
  );

const removeProducts = async (productsToRemove: string[]) =>
  ProductSchema.deleteMany({ _id: { $in: productsToRemove } });

const updateProductByFilter = ({
  update,
  filter,
  options,
}: {
  update: Partial<InsertProductPayload>;
  filter: FilterQuery<Product>;
  options: QueryOptions<Product>;
}) => ProductSchema.findOneAndUpdate<Product>(filter, update, options);

export default {
  getProductById,
  getProductsByFilter,
  insetrProducts,
  removeProducts,
  updateProductByFilter,
  bulWriteProducts,
};
