import express from "express";
import { createHandler } from "graphql-http/lib/use/express";
import { buildSchema } from "graphql";
import mongoose from "mongoose";
import { addResolversToSchema } from "@graphql-tools/schema";

import {
  addProducts,
  productById,
  productByProducerId,
  removeProductsByIds,
  updateProduct,
} from "./controllers/product";
import { processImport } from "./controllers/productImport";
import { producerById } from "./controllers/producer";

const PORT = parseInt(process.env.PORT) || 4000;
const { DB_URI, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = process.env;
const MONGODB_URL =
  DB_URI ||
  `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin`;

(async () => {
  await mongoose.connect(MONGODB_URL);

  const schema = buildSchema(`
    type Query {
      product(_id: String!): Product
      products(producerId: String!): [ProductListItem]!
    }

    type Mutation {
      startImport: Boolean
      addProducts(products: [ProductAddInput!]!): [ProductListItem]!
      removeProducts(ids: [String!]!): Boolean
      updateProduct(product: ProductUpdateInput!): Product!
    }
  
    type Product {
      _id: String!
      vintage: String!
      name: String!
      producerId: String!
      producer: Producer!
    }
  
    type ProductListItem {
      _id: String!
      vintage: String!
      name: String!
      producerId: String!
    }
  
    type Producer {
      _id: String!
      name: String!
      country: String
      region: String
    }

    input ProductAddInput {
      vintage: Int!
      name: String!
      producerId: String!
    }

    input ProductUpdateInput {
      _id: String!
      vintage: Int
      name: String
      producerId: String
    }
  `);

  const resolvers = {
    Query: {
      product: (obj, args) => productById(args),
      products: (obj, args) => productByProducerId(args),
    },
    Mutation: {
      startImport: () => {
        processImport();
        return true;
      },
      removeProducts: async (obj, args) => {
        await removeProductsByIds(args);
        return true;
      },
      addProducts: (obj, args) => addProducts(args),
      updateProduct: (obj, args) => updateProduct(args.product),
    },
    Product: {
      producer: (parent) => producerById(parent.producerId),
    },
  };

  const schemaWithResolvers = addResolversToSchema({ schema, resolvers });

  const app = express();
  app.all(
    "/graphql",
    createHandler({
      schema: schemaWithResolvers,
    }),
  );

  app.listen(PORT);

  console.log(`Running a GraphQL API server at :${PORT}`);
})();
