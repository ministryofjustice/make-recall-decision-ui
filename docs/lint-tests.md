# Linting and tests

## Pre-commit hooks
After `npm install`, files will be created under both .git/hooks and .husky, that will automatically lint (and fix) any staged files in your commits, plus run a type check.

## Typescript definitions generated from manage-recalls-api Swagger endpoint
```
npm run swagger-to-ts
```

Note - you should be connected to the VPN when running this script, or it won't be authorized to hit the Swagger endpoint.

Types are output to `./server/@types/make-recall-decision-api`.
The online swagger, for comparison, is [here]
(https://make-recall-decision-api.hmpps.service.justice.gov.uk/swagger-ui/index.html)

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

## Run E2E tests against local containers
All dependencies will be mocked, including upstream APIs used by make-recall-decision-api, and HMPPS Auth.

Set the CYPRESS_USERNAME and CYPRESS_PASSWORD env vars in the [.env.sample](./.env.sample) file when you copy it to .env. You can obtain the username and password from the team.

Run all services:
```
./scripts/start-services-for-e2e-tests-local.sh
```

Then, run the UI separately:
```
npm run start:e2e
```

Open Cypress, from there you can run the tests:
```
npm run e2e
```

## E2E Tests on CircleCI

The E2E tests are ran against the `dev` and `preprod` environments after deployment. The user credentials they use to log into the service are stored as [environment variables (in CircleCI)](https://app.circleci.com/settings/project/github/ministryofjustice/make-recall-decision-ui/environment-variables) called `CYPRESS_USERNAME_<environment>` and `CYPRESS_PASSWORD_<environment>`.
