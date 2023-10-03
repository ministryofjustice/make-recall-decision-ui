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

From the make-recall-decision-e2e-tests project, you can run the tests:
```
npm run e2e-ui
```

## Further Information

See the ReadMe in the [make-recall-decision-e2e-tests project](https://github.com/ministryofjustice/make-recall-decision-e2e-tests).
