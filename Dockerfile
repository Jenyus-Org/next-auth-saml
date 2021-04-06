FROM node:12.18-alpine

ENV NODE_ENV=development

WORKDIR /usr/src/app

COPY ["package.json", "package-lock.json*", "yarn.lock", "npm-shrinkwrap.json*", "./"]
RUN yarn install

COPY . .

EXPOSE 3000

CMD ["yarn", "dev"]
