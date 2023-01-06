# Tests

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

## E2E tests

### Run E2E tests against local containers
All dependencies will be mocked, including upstream APIs used by make-recall-decision-api, and HMPPS Auth.

Set the CYPRESS_PASSWORD and CYPRESS_PASSWORD_SPO env vars in the [.env.local.sample](./.env.local.sample) file when you copy it to .env. The passwords can be obtained from the CYPRESS_PASSWORD_local and CYPRESS_PASSWORD_SPO_local env vars in [CircleCi](https://app.circleci.com/settings/project/github/ministryofjustice/make-recall-decision-ui/environment-variables)

Run all services:
```
./scripts/start-services-for-e2e-tests-local.sh
```

Then, run the UI app separately:
```
npm run start:e2e
```

Open Cypress, from there you can run the tests:
```
npm run e2e
```

### Running E2E tests against dev or preprod env on CircleCI

If the tests in the CI pipeline fail, you can try to reproduce by running the E2E tests in your local repo against dev or preprod env.

You can run your local tests against dev env using:

```
npx cypress open --env USERNAME=<username>,PASSWORD=<password>,USERNAME_SPO=<username_spo>,PASSWORD_SPO=<password_spo>,ENV=dev --config-file e2e_tests/cypress.config.ts --config baseUrl=https://make-recall-decision-dev.hmpps.service.justice.gov.uk
```

You can run your local tests against preprod env using:

```
npx cypress open --env USERNAME=<username>,PASSWORD=<password>,USERNAME_SPO=<username_spo>,PASSWORD_SPO=<password_spo>,CRN=<crn1>,CRN2=<crn2>,CRN3=<crn3>,CRN4=<crn4>,CRN5=<crn5>,ENV=preprod --config-file e2e_tests/cypress.config.ts --config baseUrl=https://make-recall-decision-preprod.hmpps.service.justice.gov.uk
```

With params replaced as follows:
- USERNAME - your Delius username for dev
- PASSWORD - your Delius password for dev
- USERNAME_SPO - the value of the CYPRESS_USERNAME_SPO_dev env var in [CircleCi](https://app.circleci.com/settings/project/github/ministryofjustice/make-recall-decision-ui/environment-variables)
- PASSWORD_SPO - the value of the CYPRESS_PASSWORD_SPO_dev env var in [CircleCi](https://app.circleci.com/settings/project/github/ministryofjustice/make-recall-decision-ui/environment-variables)
- (for preprod only) - CRN1, 2 etc - the values of CRN_preprod, CRN2_preprod etc in CircleCI

### E2E Tests on CircleCI

The E2E tests are ran against the `dev` and `preprod` environments after deployment. The user credentials they use to log into the service are stored as [environment variables (in CircleCI)](https://app.circleci.com/settings/project/github/ministryofjustice/make-recall-decision-ui/environment-variables) called `CYPRESS_USERNAME_<environment>`, `CYPRESS_PASSWORD_<environment>`, `CYPRESS_USERNAME_SPO_<environment>`, `CYPRESS_PASSWORD_SPO_<environment>`.
