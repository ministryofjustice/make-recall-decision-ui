# Making a Recall Decision UI (`make-recall-decision-ui`)

[![repo standards badge](https://img.shields.io/badge/dynamic/json?color=blue&style=for-the-badge&logo=github&label=MoJ%20Compliant&query=%24.data%5B%3F%28%40.name%20%3D%3D%20%22make-recall-decision-ui%22%29%5D.status&url=https%3A%2F%2Foperations-engineering-reports.cloud-platform.service.justice.gov.uk%2Fgithub_repositories)](https://operations-engineering-reports.cloud-platform.service.justice.gov.uk/github_repositories#make-recall-decision-ui)
[![CircleCI](https://circleci.com/gh/ministryofjustice/make-recall-decision-ui/tree/main.svg?style=svg)](https://circleci.com/gh/ministryofjustice/make-recall-decision-ui)

TODO: Describe project

## Dependencies

The app requires:

- hmpps-auth - for authentication
- redis - session store and token caching
- make-recall-decision-api - main API for the app

## Running the app locally against dev env services

### Setup

Install dependencies using `npm install`, ensuring you are using Node v16.x

There are 2 .env sample files depending on what you are trying to do:
- To run the setup pointing at local services, then use the .env.local.sample file in the root of this repo
- To run the setup pointing at dev services, then use the .env.dev.sample file in the root of this repo

Name the copy as .env, then complete with the missing env values (the team will provide them). NOTE - don't wrap client secrets in quotes.

In your shell config eg .zshrc, set:
```
export SYSTEM_CLIENT_ID=<YOUR DEV CLIENT ID, USUALLY YOUR NAME>
export SYSTEM_CLIENT_SECRET='<YOUR DEV CLIENT SECRET, INSIDE SINGLE QUOTES>'
```

### Run against dev env

NOTE - you should be connected to the MoJ digital VPN, because you'll be connecting to services in dev env.

To start the API and local dependencies, excluding the UI:

```
./scripts/start-services-no-ui.sh
```

And then, to start the UI app:

```
npm run start:dev
```

Then log in with your dev HMPPS auth credentials.

### Notes for M1 Mac Users

If you're using an M1/arm based Mac, you'll need to also have a checkout of [hmpps-auth](https://github.com/ministryofjustice/hmpps-auth) alongside your checkouts of `make-recall-decision-ui` and `make-recall-decision-api`, and pass all of the start scripts the `-a` parameter:

```
./scripts/start-services-no-ui.sh -a
```

This will build the `hmpps-auth` container image locally on your machine before starting things up. This is needed as the currently released container for `hmpps-auth` does not run properly on M1 macs.

## Automated tests, linting and typescript

[Doc](./docs/lint-tests.md)

## E2E Tests on CircleCI

The E2E tests are ran against the `dev` and `preprod` environments after deployment. The user credentials they use to log into the service are stored as [environment variables (in CircleCI)](https://app.circleci.com/settings/project/github/ministryofjustice/make-recall-decision-ui/environment-variables) called `CYPRESS_USERNAME_<environment>` and `CYPRESS_PASSWORD_<environment>`.

## Dependency Checks

The template project has implemented some scheduled checks to ensure that key dependencies are kept up to date.
If these are not desired in the cloned project, remove references to `check_outdated` job from `.circleci/config.yml`

## Feature flags

A simple [feature flags mechanism](./docs/feature-flags.md) is available to show or hide new features.

## Deployment / configuration
- [Environment variables](./docs/env-vars.md)
- [Deployment / Helm](./docs/helm-deploy.md)

## Form auto-filler
[Doc](./docs/autofill-forms.md)