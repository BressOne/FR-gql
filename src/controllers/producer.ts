import { Context } from "src/types/common";
import { Producer } from "../types/db";

export const producerById = async (
  {
    _id,
  }: {
    _id: string;
  },
  ctx: Context,
): Promise<Producer> => {
  const producer = await ctx.models.producerModel.getProducerById(_id);
  return producer;
};
