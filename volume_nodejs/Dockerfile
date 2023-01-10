FROM node:16.15.1

WORKDIR /usr/src/app

COPY package*.json ./
COPY . .

EXPOSE 27015
RUN npm install
RUN npm run start