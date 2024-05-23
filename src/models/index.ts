import producerModel from "./producer";
import productModel from "./product";

export type Models = {
  producerModel: typeof producerModel;
  productModel: typeof productModel;
};

export default {
  producerModel,
  productModel,
};
