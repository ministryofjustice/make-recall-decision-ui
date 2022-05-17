# Linting and tests

## Pre-commit hooks
After `npm install`, files will be created under both .git/hooks and .husky, that will automatically lint (and fix) any staged files in your commits, plus run a type check.

## Typescript check

To run a Typescript compilation check:
```
npm run typecheck
```

## Run linter

`npm run lint`

to fix any lint issues automatically:

`npm run lint:fix`

## Run unit tests

`npm run test`

with coverage:

`npm run test:coverage`

Coverage stats will be output to stdout and /coverage

## Run integration tests

For local running, start a test db, redis, and wiremock instance by:

```
docker compose -f docker-compose-test.yml up
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

## Debugging the node app when running Cypress
[Running Chrome debugger](./running-app.md#debugging-in-chrome-developer-tools)

## Debugging the Cypress test code
1. open dev tools
2. do not click on the node symbol (green kube), instead go to Sources tab
3. `cmd + o` in order to open file search
4. put a break point on the needed line or type the word `debugger` in the cypress code and save if break points are unreliable 
5. rerun the test 

## Run E2E tests

Set the CYPRESS_USERNAME and CYPRESS_PASSWORD env vars in the [.env.sample](./.env.sample) file when you copy it to .env

Run all required services as per the [readme](../README.md). Then,

```
npm run e2e
```

Or run in headless mode:

```
npm run e2e:ci
```