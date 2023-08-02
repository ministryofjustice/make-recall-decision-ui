# E2E tests

The E2E tests are colocated in this repo, in the `e2e-tests` directory. They run using Cypress, and share commands with the integration tests.

There's a HMPPS dev 'community of practice' talk on [how the E2E tests are set up](https://drive.google.com/file/d/1OeekvkViazrYNJXGMZrlM8UZU-Z71x6X/view).

## Run E2E tests against local containers

All dependencies will be mocked, including upstream APIs used by make-recall-decision-api, and HMPPS Auth.

Set the `CYPRESS_PASSWORD`, `CYPRESS_PASSWORD_SPO` and `CYPRESS_PASSWORD_ACO` env vars in the [.env.local.sample](./.env.local.sample) file and copy it as `.env`. 
The passwords can be obtained from the `CYPRESS_PASSWORD_local`, `CYPRESS_PASSWORD_SPO_local` and `CYPRESS_PASSWORD_ACO_local` env vars in [CircleCi](https://app.circleci.com/settings/project/github/ministryofjustice/make-recall-decision-ui/environment-variables)

Run this command in the root of the project. It will start `make-recall-decision-api` and other dependencies:

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

### Parameter supported
The following parameters can be passed during a test run
- `TAGS`: Cucumber tag expression can be passed to restrict the scenarios that get run in a test run
- `ENV`: environment where you want to run the tests, e.g. `dev` or `preprod`. If nothing is passed tests are run on local instance.

#### Passing parameters
To pass any parameter to tests, use the `--env` param of cypress, e.g.
```
npm run e2e-ui -- --env TAGS='@E2E and not @ignore',ENV=dev
```

## E2E Tests on CircleCI

E2E tests are not run on a feature branch, only unit, integration and accessibility tests are run. Once a feature branch is merged into `main`, the E2E tests are ran against the `dev` and `preprod` environments after deployment. The user credentials they use to log into the service are stored as [environment variables (in CircleCI)](https://app.circleci.com/settings/project/github/ministryofjustice/make-recall-decision-ui/environment-variables) called `CYPRESS_USERNAME_<environment>`, `CYPRESS_PASSWORD_<environment>`, `CYPRESS_USERNAME_SPO_<environment>`, `CYPRESS_PASSWORD_SPO_<environment>`,`CYPRESS_USERNAME_ACO_<environment>`, `CYPRESS_PASSWORD_ACO_<environment>`.

### Running E2E tests on CircleCI on demand

The E2E test can be run manually on `dev` & `preprod` from the [Pipeline](https://app.circleci.com/pipelines/github/ministryofjustice/make-recall-decision-ui?branch=main) page 

To run the tests:
1. Click on **Trigger Pipeline** button
2. Click on **Add another parameter** button
3. Select `boolean` in **Parameter type** dropdown
4. Enter `e2e-check-dev` in **Name** field for 'dev' and `e2e-check-preprod` for 'preprod'
5. Select `true` in the **Value** field
6. If you want to override the cucumber tags you can add another string parameter called `e2e-tags` and enter a valid cucumber tag expression, .e.g. `@E2E and not @ignore` without any quotes. This is optional, if not passed it defaults to `@E2E` when running on `dev` & `@smoke` on `preprod`.

If a test fails, look under the **ARTIFACTS** tab for the CircleCI job to see a screenshot, video and logs of the failed step.

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
- USERNAME - your Delius username for `dev`/`preprod`
- PASSWORD - your Delius password for `dev`/`preprod`
- USERNAME_SPO - the value of the `CYPRESS_USERNAME_SPO_dev`/`CYPRESS_USERNAME_SPO_preprod` env var in [CircleCi](https://app.circleci.com/settings/project/github/ministryofjustice/make-recall-decision-ui/environment-variables)
- PASSWORD_SPO - the value of the `CYPRESS_PASSWORD_SPO_dev`/`CYPRESS_PASSWORD_SPO_preprod` env var in [CircleCi](https://app.circleci.com/settings/project/github/ministryofjustice/make-recall-decision-ui/environment-variables)
- USERNAME_ACO - the value of the `CYPRESS_USERNAME_ACO_dev`/`CYPRESS_USERNAME_ACO_preprod` env var in [CircleCi](https://app.circleci.com/settings/project/github/ministryofjustice/make-recall-decision-ui/environment-variables)
- PASSWORD_ACO - the value of the `CYPRESS_PASSWORD_ACO_dev`/`CYPRESS_PASSWORD_ACO_preprod` env var in [CircleCi](https://app.circleci.com/settings/project/github/ministryofjustice/make-recall-decision-ui/environment-variables)
- (for preprod only) - CRN1, 2 etc - the values of CRN_preprod, CRN2_preprod etc in CircleCI
