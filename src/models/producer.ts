import { InsertProducerPayload, Producer } from "../types/db";
import ProducerSchema from "../schemas/producer";
import mongoose, { FilterQuery } from "mongoose";

const getProducerById = async (_id: string) => {
  const objectId = new mongoose.Types.ObjectId(_id);
  const data = await ProducerSchema.findOne<Producer>({ _id: objectId });
  return data;
};

const insertProducers = async (producersToInsert: InsertProducerPayload[]) =>
  ProducerSchema.insertMany<Producer>(producersToInsert, {
    includeResultMetadata: true,
  });

const findProducersByNames = async (producerNames: string[]) => {
  const shapedFilter: FilterQuery<Producer> = {
    $or: producerNames.map((name) => ({
      name,
    })),
  };
  const data = await ProducerSchema.find<Producer>(shapedFilter);
  return data;
};

const findProducersByFilter = async (filter: FilterQuery<Producer>) =>
  ProducerSchema.find<Producer>(filter);

export default {
  insertProducers,
  findProducersByNames,
  getProducerById,
  findProducersByFilter,
};
