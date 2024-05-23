import express from "express";
import { createHandler } from "graphql-http/lib/use/express";
import mongoose from "mongoose";
import { addResolversToSchema } from "@graphql-tools/schema";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { loadSchema } from "@graphql-tools/load";

import models from "./models";
import { producerById } from "./controllers/producer";
import {
  productById,
  productByProducerId,
  removeProductsByIds,
  addProducts,
  updateProduct,
} from "./controllers/product";
import { processImport } from "./controllers/productImport";

const PORT = parseInt(process.env.PORT) || 4000;
const { DB_URI, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = process.env;
const MONGODB_URL =
  DB_URI ||
  `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin`;

(async () => {
  await mongoose.connect(MONGODB_URL);

  const resolvers = {
    Query: {
      product: (obj, args, ctx) => productById(args, ctx),
      products: (obj, args, ctx) => productByProducerId(args, ctx),
    },
    Mutation: {
      startImport: (obj, args, ctx) => {
        processImport(ctx);
        return true;
      },
      removeProducts: async (obj, args, ctx) => {
        await removeProductsByIds(args, ctx);
        return true;
      },
      addProducts: (obj, args, ctx) => addProducts(args, ctx),
      updateProduct: (obj, args, ctx) => updateProduct(args.product, ctx),
    },
    Product: {
      producer: (parent, args, ctx) => producerById(parent.producerId, ctx),
    },
  };

  const schema = await loadSchema("src/gqlSchemas/*.graphql", {
    loaders: [new GraphQLFileLoader()],
  });

  const schemaWithResolvers = addResolversToSchema({ schema, resolvers });

  const app = express();
  app.all(
    "/graphql",
    createHandler({
      schema: schemaWithResolvers,
      context: { models },
    }),
  );

  app.listen(PORT);

  console.log(`Running a GraphQL API server at :${PORT}`);
})();
