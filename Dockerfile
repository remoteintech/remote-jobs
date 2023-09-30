FROM node:alpine

RUN mkdir node

COPY . ./node

WORKDIR /node/

RUN npm install

CMD npm start



