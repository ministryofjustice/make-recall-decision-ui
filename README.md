# Making a Recall Decision UI (`make-recall-decision-ui`)

![repo standards badge](https://img.shields.io/badge/dynamic/json?color=blue&style=for-the-badge&logo=github&label=MoJ%20Compliant&query=%24.data%5B%3F%28%40.name%20%3D%3D%20%22make-recall-decision-ui%22%29%5D.status&url=https%3A%2F%2Foperations-engineering-reports.cloud-platform.service.justice.gov.uk%2Fgithub_repositories)
[![CircleCI](https://circleci.com/gh/ministryofjustice/make-recall-decision-ui/tree/main.svg?style=svg)](https://circleci.com/gh/ministryofjustice/make-recall-decision-ui)

TODO: Describe project

## Running the app

The easiest way to run the app is to use docker compose to create the service and all dependencies.

`docker-compose pull`

`docker-compose up`

### Dependencies

The app requires:
* hmpps-auth - for authentication
* redis - session store and token caching

### Running the app for development

To start the main services excluding the example typescript template app:

`docker-compose up --scale=app=0`

Install dependencies using `npm install`, ensuring you are using >= `Node v14.x`

And then, to build the assets and start the app with nodemon:

`npm run start:dev`

### Run linter

`npm run lint`

### Run tests

`npm run test`

### Running integration tests

For local running, start a test db, redis, and wiremock instance by:

`docker-compose -f docker-compose-test.yml up`

Then run the server in test mode by:

`npm run start-feature` (or `npm run start-feature:dev` to run with nodemon)

And then either, run tests in headless mode with:

`npm run int-test`

Or run tests with the cypress UI:

`npm run int-test-ui`

### Dependency Checks

The template project has implemented some scheduled checks to ensure that key dependencies are kept up to date.
If these are not desired in the cloned project, remove references to `check_outdated` job from `.circleci/config.yml`
