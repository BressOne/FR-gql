# F+R coding test

Provided exercise is an example implementation of a GQL API based on NodeJS. This API operate over producers and products entities. GQL schema is self descriptive, refere to typedefinitions of graphQL for the details.

To get started, ensure you are running nodeJS >=18.19.0.

Stability is not guaranteed if you are using older versions of NodeJS.

1.  [Requirements](#requirements)
2.  [Installation](#installation)
3.  [Environment](#environment)
4.  [API](#api)
5.  [Features](#features)

## Requirements

[](https://github.com/BressOne/spb_be/blob/main/README.md#requirements)

- Node.js >=18.19.0
- WSL/Linux/MacOS
- Yarn 1.22.12
- MongoDB instance - or just use Docker (see Installation Docker compose)

## Installation

### Docker compose

The easiest way to launch - run `docker-compose up` - all already set up and the server will appear on `localhost:4000`

### Dev

To install dependencies, run the following command: `yarn`
To start the application in development mode with nodemon, use: `DB_URI=your.db.connection.string yarn dev`
Or dev build with `yarn build` and `yarn start` commands.
The app will appear on localhost:4000 by default.

### Dockerfile

Another way to run setup - build a docker image out of provided Dockerfile. before building replace `ENV DB_URI your.db.connection.string` with your actual mongodb connection string.

Happy explore!

## Environment

There are several env vars, which the service can be adjusted with:

| var                  | Effect                                                                                                                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PORT                 | The server port to start on. Note that Dockerfile uses 4000:4000 by default, you'll need to adjust it if you want other port. Defaults to 4000                                              |
| DB_URI               | Mongodb connection string. Has higher priority than db connection string parts below: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT, and is used if provided. Required. Does not defaults |
| DB_HOST              | Mongodb hostname. Does not defaults, ignored if DB_URI is provided                                                                                                                          |
| DB_USER              | Mongodb connection username. Does not defaults, ignored if DB_URI is provided                                                                                                               |
| DB_PASSWORD          | Mongodb connection user pasword. Does not defaults, ignored if DB_URI is provided                                                                                                           |
| DB_NAME              | Mongodb database name. Does not defaults, ignored if DB_URI is provided                                                                                                                     |
| DB_PORT              | Mongodb port. Does not defaults, ignored if DB_URI is provided                                                                                                                              |
| BATCHING_SIZE        | CSV file import processing batching size. Defaults to 100 if not provided                                                                                                                   |
| CSV_IMPORT_DELIMITER | CSV file import columns delimiter. Defaults to ',' if not provided                                                                                                                          |
| CSV_IMPORT_URI       | CSV file URI location. Defaults to resonable value if not provided                                                                                                                          |

My default dev config is:

```
    DB_URI =mongodb+srv://username:dom.net/DBName?retryWrites=true&w=majority
```

## API

Is a gql api available on `yourdomain:PORT/graphql` By default is http://localhost:4000/graphql
NOTE: i am not providing any playground, so use any of your choice, i prefer [altair](https://chromewebstore.google.com/detail/altair-graphql-client/flnheeellpciglgpaodhkhmapeljopja) as chrome extension

According to the task, implements:

```
Queries:
	product (  _id String! )  Product
	products (  producerId String! )  [ProductListItem]!
Mutations:
	startImport
```

## Features

### TypeScript v5.

App is covered by TS with all files it has.
That makes code self-descriptive and robust. Consider it as musthave.

### Streams

Importing implements streaming processing of an imported file.

### GQL

API is implementing graphql with typedefs and resolvers.
