FROM node:10-alpine

RUN npm install --global serve

WORKDIR /usr/src

COPY package.json package-lock.json ./

RUN npm install

COPY . ./

RUN npm run build

RUN rm -rf node_modules
