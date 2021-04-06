## Installation

```bash
$ npm install
$ yarn
```

## Running the app

```bash
#default
$ yarn start

# development
$ yarn start:dev
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Create a task to src
npx @nestjs/cli g module appConfig
npx @nestjs/cli g controller appConfig --no-spec
npx @nestjs/cli g service appConfig --no-spec

## Create migration file
npx typeorm migration:create -n fileName -d src/migrations
