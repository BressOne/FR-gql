import { Schema, model } from "mongoose";

export const schemaName = "producer";

const producerSchema = new Schema({
  name: { type: String, required: true },
  country: { type: String, required: false },
  region: { type: String, required: false },
});

producerSchema.index({ name: 1, country: 1, region: 1 }, { unique: true });

export default model(schemaName, producerSchema);
