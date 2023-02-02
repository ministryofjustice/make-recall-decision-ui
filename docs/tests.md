# Unit & integration tests

See also, [E2E tests](./e2e_tests.md)

## Run unit tests

`npm run test`

with coverage:

`npm run test:coverage`

Coverage stats will be output to stdout and /coverage

## Run integration tests

For local running, start a test db, redis, and wiremock instance by:

```
docker compose -f docker-compose-test.yml up -d
```

Then run the server in test mode by:

```
npm run start-feature
```

(or `npm run start-feature:dev` to run with nodemon)

And then either, run tests in headless mode with:

```
npm run int-test
```

Or run tests with the cypress UI:

```
npm run int-test-ui
```

To get debug output when running cypress:

`DEBUG=cypress:* npm run int-test-ui`

## Accessibility tests

These run in Cypress and test a selection of pages against accessibility standards using Axe.

```
docker compose -f docker-compose-test.yml up -d
```

then 

```
npm run start-feature
```

and to run the a11y tests:

```
npm run accessibility-test-ui
```