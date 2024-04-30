import axios from "axios";
import { parse } from "csv-parse";
import { findProducersByNames, insertProducers } from "../models/producer";
import { insetrProducts } from "../models/product";
import { ProducerBase, ProductBase } from "../types/db";
import { validateCSVRow } from "../validators/csv";

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
        const { vintage, productName, producerName, country, region } =
            validateCSVRow(entry);
        if (producerName === "") {
            console.log({ vintage, productName, producerName, country, region });
        }
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
    });
    return {
        products: Object.values(products),
        producers: Object.values(producers),
    };
};

const processCreateEntities = async (data: string[][]) => {
    const { products, producers } = prepareData(data);

    const presentProducers = await findProducersByNames(
        producers.map((el) => el.name),
    );

    const newProducers = await insertProducers(
        producers.filter(
            (candidate) =>
                !presentProducers.some((existing) => existing.name === candidate.name),
        ),
    );

    const producersHeap = [...presentProducers, ...newProducers];
    await insetrProducts(
        products.map((candidate) => ({
            ...candidate,
            producerId: producersHeap
                .find((el) => el.name === candidate.producerName)
                ._id.toString(),
        })),
    );
};

export const processImport = async () => {
    let tableHeadRecieved = false;
    let buffer: string[][] = [];

    const parser = parse({
        delimiter: csvDelimiter,
    });

    const response = await axios.get(csvImportURI, {
        responseType: "stream",
    });

    const stream = response.data;

    const dataHandler = async (data: string[]) => {
        if (tableHeadRecieved) {
            buffer.push(data);
            if (buffer.length >= batchingSize && !stream.isPaused()) {
                stream.pause();
                parser.pause()
                try {
                    const duplicate = [...buffer];
                    buffer = [];
                    await processCreateEntities(duplicate);

                } catch (error) {
                    console.debug(
                        "Error during import, no transaction rollback will be done.",
                        error,
                    );
                }
                stream.resume();
                parser.resume()
            }
        } else {
            tableHeadRecieved = true;
        }
        return;
    };

    parser.on("data", dataHandler);

    parser.on("error", (err) => {
        console.debug(err.message);
    });

    parser.on("end", async () => {
        if (buffer.length) {
            try {
                const duplicate = [...buffer];
                buffer = [];
                await processCreateEntities(duplicate);
            } catch (error) {
                console.debug(
                    "Error during import, no transaction rollback will be done.",
                    error,
                );
            }
        }
    });

    stream.pipe(parser);
};
