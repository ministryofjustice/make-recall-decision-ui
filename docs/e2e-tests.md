# E2E tests

The E2E tests are colocated in this repo, in the `e2e-tests` directory. They run using Cypress, and share commands with the integration tests.

There's a HMPPS dev 'community of practice' talk on [how the E2E tests are set up](https://drive.google.com/file/d/1OeekvkViazrYNJXGMZrlM8UZU-Z71x6X/view).

## Run E2E tests against local containers

All dependencies will be mocked, including upstream APIs used by make-recall-decision-api, and HMPPS Auth.

Set the CYPRESS_PASSWORD and CYPRESS_PASSWORD_SPO env vars in the [.env.local.sample](./.env.local.sample) file when you copy it to .env. The passwords can be obtained from the CYPRESS_PASSWORD_local and CYPRESS_PASSWORD_SPO_local env vars in [CircleCi](https://app.circleci.com/settings/project/github/ministryofjustice/make-recall-decision-ui/environment-variables)

Run this command in the root of the project. It will start make-recall-decision-api up and other dependencies:

```
./scripts/start-services-for-e2e-tests-local.sh
```

Then, run the UI app separately:
```
npm run start:e2e
```

Open Cypress, from there you can run the tests:
```
npm run e2e-ui
```

## E2E Tests on CircleCI

The E2E tests are ran against the `dev` and `preprod` environments after deployment. The user credentials they use to log into the service are stored as [environment variables (in CircleCI)](https://app.circleci.com/settings/project/github/ministryofjustice/make-recall-decision-ui/environment-variables) called `CYPRESS_USERNAME_<environment>`, `CYPRESS_PASSWORD_<environment>`, `CYPRESS_USERNAME_SPO_<environment>`, `CYPRESS_PASSWORD_SPO_<environment>`.

The E2E tests, when run against `dev` or `preprod`, use some fixtures with a copy of data from Delius, to make assertions against when checking the Part A. The fixtures are in the `./e2e_tests/utils/test_data` folder. If the data for a CRN changes in Delius, then the corresponding fixture will need to be updated.

If a test fails, look under the artefacts tab for the CircleCI job to see a screenshot of the failed step.

## Running E2E tests locally against the service deployed on dev or preprod

You can run the E2E tests in your local repo against dev or preprod env. Useful in case the CircleCI tests are failing and you want to reproduce the issue locally.

You can run your local tests against dev env using:

```
npx cypress open --env USERNAME=<username>,PASSWORD=<password>,USERNAME_SPO=<username_spo>,PASSWORD_SPO=<password_spo>,USERNAME_ACO=<username_aco>,PASSWORD_ACO=<password_aco>,ENV=dev --config-file e2e_tests/cypress.config.ts --config baseUrl=https://make-recall-decision-dev.hmpps.service.justice.gov.uk
```

You can run your local tests against preprod env using:

```
npx cypress open --env USERNAME=<username>,PASSWORD=<password>,USERNAME_SPO=<username_spo>,PASSWORD_SPO=<password_spo>,USERNAME_ACO=<username_aco>,PASSWORD_ACO=<password_aco>,CRN=<crn1>,CRN2=<crn2>,CRN3=<crn3>,CRN4=<crn4>,CRN5=<crn5>,ENV=preprod --config-file e2e_tests/cypress.config.ts --config baseUrl=https://make-recall-decision-preprod.hmpps.service.justice.gov.uk
```

With params replaced as follows:
- USERNAME - your Delius username for dev
- PASSWORD - your Delius password for dev
- USERNAME_SPO - the value of the CYPRESS_USERNAME_SPO_dev env var in [CircleCi](https://app.circleci.com/settings/project/github/ministryofjustice/make-recall-decision-ui/environment-variables)
- PASSWORD_SPO - the value of the CYPRESS_PASSWORD_SPO_dev env var in [CircleCi](https://app.circleci.com/settings/project/github/ministryofjustice/make-recall-decision-ui/environment-variables)
- (for preprod only) - CRN1, 2 etc - the values of CRN_preprod, CRN2_preprod etc in CircleCI
