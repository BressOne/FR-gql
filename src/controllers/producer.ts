import { Producer } from "../types/db";
import { getProducerById } from "../models/producer";

export const producerById = async ({
  _id,
}: {
  _id: string;
}): Promise<Producer> => {
  const producer = await getProducerById(_id);
  return producer;
};
