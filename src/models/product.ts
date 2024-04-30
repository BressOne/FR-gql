import { InsertProductPayload, Product } from "../types/db";
import ProductSchema from "../schemas/product";
import mongoose, { FilterQuery } from "mongoose";

const getProductById = async (_id: string) => {
  const objectId = new mongoose.Types.ObjectId(_id);
  return ProductSchema.findOne<Product>({ _id: objectId });
};

const getProductsByFilter = async (filter: FilterQuery<Product>) =>
  ProductSchema.find<Product>(filter);

const insetrProducts = async (productsToInsert: InsertProductPayload[]) =>
  ProductSchema.insertMany(productsToInsert);

export { getProductById, getProductsByFilter, insetrProducts };
