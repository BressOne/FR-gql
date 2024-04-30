import { Schema, model } from "mongoose";

export const schemaName = "product";

const productSchema = new Schema({
  vintage: { type: Number, required: true },
  name: { type: String, required: true },
  producerId: { type: Schema.Types.ObjectId, required: true },
});

productSchema.index({ vintage: 1, name: 1, producerId: 1 }, { unique: true });

export default model(schemaName, productSchema);
