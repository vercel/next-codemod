FROM mhart/alpine-node:10
WORKDIR /src
COPY package.json ./
COPY yarn.lock ./
RUN yarn
COPY . ./
RUN yarn test
