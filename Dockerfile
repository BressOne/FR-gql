FROM node:18.19.1-alpine3.18

WORKDIR /app

ENV DB_URI your.db.connection.string

COPY package*.json yarn.lock ./

RUN yarn

COPY . .

RUN yarn build

EXPOSE 4000

CMD ["yarn", "start"]