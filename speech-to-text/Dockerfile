FROM node:alpine
WORKDIR /app
COPY package.json ./
RUN apk update && apk add git
RUN apk add sox
RUN apk add alsa-utils
RUN npm install
COPY ./ ./

CMD ["npm", "start"]