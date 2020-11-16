FROM node:lts

WORKDIR /src

COPY . .

RUN npm install

CMD npm start