import axios from "axios";
import { parse } from "csv-parse";
import { ProducerBase, ProductBase } from "../types/db";
import { validateCSVRow } from "../validators/csv";
import { Context } from "../types/common";
import { Transform, TransformCallback, Writable } from "stream";
import { pipeline } from "node:stream/promises";

const batchingSize = process.env.BATCHING_SIZE
  ? parseInt(process.env.BATCHING_SIZE)
  : 100;
const csvDelimiter = process.env.CSV_IMPORT_DELIMITER || ",";
const csvImportURI =
  process.env.CSV_IMPORT_URI || "https://api.frw.co.uk/feeds/all_listings.csv";

const prepareData = (data: string[][]) => {
  const products: Record<string, ProductBase & { producerName: string }> = {};
  const producers: Record<string, ProducerBase> = {};
  data.forEach((entry) => {
    const row = validateCSVRow(entry);
    if (row) {
      const { vintage, productName, producerName, country, region } = row;
      const identifier = vintage + productName + producerName;
      if (!products[identifier]) {
        products[identifier] = {
          vintage: vintage,
          name: productName,
          producerName: producerName,
        };
        producers[producerName] = {
          name: producerName,
          ...(country ? { country } : {}),
          ...(region ? { region } : {}),
        };
      }
    }
  });
  return {
    products: Object.values(products),
    producers: Object.values(producers),
  };
};

class DbStreamWritable extends Writable {
  private processorFunction: (data: string[][], ctx: Context) => Promise<void>;
  private ctx: Context;

  constructor({
    processorFn,
    ctx,
    ...options
  }: {
    processorFn: (data: string[][], ctx: Context) => Promise<void>;
    ctx: Context;
  } & Record<string, any>) {
    super(options);

    this.processorFunction = processorFn;
    this.ctx = ctx;
  }

  async _write(
    chunk: any,
    encoding: BufferEncoding,
    callback: (error?: Error) => void,
  ): Promise<void> {
    try {
      const chunkedEntries: string[][] = JSON.parse(chunk.toString());
      await this.processorFunction(chunkedEntries, this.ctx);
      callback(null);
    } catch (error) {
      console.error(error);
      callback(null);
    }
  }
}

class Aggregator extends Transform {
  private buffer = [];
  private tableHeadRecieved = false;

  constructor(options?: any) {
    super({ ...options, objectMode: true });
  }

  _transform(
    chunk: any,
    encoding: BufferEncoding,
    callback: TransformCallback,
  ): void {
    if (this.tableHeadRecieved) {
      this.buffer.push(chunk);
      if (this.buffer.length >= batchingSize) {
        callback(null, JSON.stringify(this.buffer));
        this.buffer = [];
      } else {
        callback(null);
      }
    } else {
      this.tableHeadRecieved = true;
      callback(null);
    }
  }

  _flush(callback: TransformCallback): void {
    callback(null, JSON.stringify(this.buffer));
    this.buffer = [];
  }
}

const processCreateEntities = async (data: string[][], ctx: Context) => {
  const { products, producers } = prepareData(data);

  const presentProducers = await ctx.models.producerModel.findProducersByNames(
    producers.map((el) => el.name),
  );

  const newProducers = await ctx.models.producerModel.insertProducers(
    producers.filter(
      (candidate) =>
        !presentProducers.some((existing) => existing.name === candidate.name),
    ),
  );

  const producersHeap = [...presentProducers, ...newProducers];
  await ctx.models.productModel.bulWriteProducts(
    products.map(({ producerName, ...candidate }) => ({
      ...candidate,
      producerId: producersHeap
        .find((el) => el.name === producerName)
        ._id.toString(),
    })),
  );
};

export const processImport = async (ctx: Context) => {
  const parser = parse({
    delimiter: csvDelimiter,
  });

  const response = await axios.get(csvImportURI, {
    responseType: "stream",
  });

  const stream = response.data;

  await pipeline([
    stream,
    parser,
    new Aggregator(),
    new DbStreamWritable({ processorFn: processCreateEntities, ctx }),
  ]);
};
