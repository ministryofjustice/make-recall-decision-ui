# E2E tests

The E2E tests are in [the e2e tests repo](https://github.com/ministryofjustice/make-recall-decision-e2e-tests/). They
run using Cypress.

There's a HMPPS dev 'community of practice' talk on [how the E2E tests are set up](https://justiceuk.sharepoint.com/:v:/r/sites/HMPPSDeveloperCommunityofPractice/Shared%20Documents/COP%20Recordings/HMPPS%20Dev%20CoP_%20lightning%20talks%20(2022-09-07%2015_03%20GMT+3)%20(1).mp4?csf=1&web=1&e=XtIcxp&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJTdHJlYW1XZWJBcHAiLCJyZWZlcnJhbFZpZXciOiJTaGFyZURpYWxvZy1MaW5rIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXcifX0%3D).

## Run E2E tests against local containers

All dependencies will be mocked, including upstream APIs used by make-recall-decision-api, and HMPPS Auth.

Set the `CYPRESS_PASSWORD_PO`, `CYPRESS_PASSWORD_SPO` and `CYPRESS_PASSWORD_ACO` env vars in the [.env.local.sample](./.env.local.sample)
file and copy it as `.env`. The passwords can be obtained from the `local_CYPRESS_PASSWORD_PO`, `local_CYPRESS_PASSWORD_SPO`
and `local_CYPRESS_PASSWORD_ACO` env vars in [CircleCi](https://app.circleci.com/settings/project/github/ministryofjustice/make-recall-decision-ui/environment-variables)

Run the following command in the root of the project. It will start `make-recall-decision-api` and other dependencies:

```
./scripts/start-services-for-e2e-tests-local.sh
```

Then, run the UI app separately:
```
npm run start:e2e
```

From the make-recall-decision-e2e-tests project, make a copy of `.env.local.sample` (the version in that repo), name it
`.env` and run the following:
```
npm run e2e-ui
```

## Further Information

See the ReadMe in the [make-recall-decision-e2e-tests project](https://github.com/ministryofjustice/make-recall-decision-e2e-tests).
