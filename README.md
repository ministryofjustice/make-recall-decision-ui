# UI for "Decide if someone should be recalled or not" (`make-recall-decision-ui`)

[![repo standards badge](https://img.shields.io/badge/dynamic/json?color=blue&style=for-the-badge&logo=github&label=MoJ%20Compliant&query=%24.data%5B%3F%28%40.name%20%3D%3D%20%22make-recall-decision-ui%22%29%5D.status&url=https%3A%2F%2Foperations-engineering-reports.cloud-platform.service.justice.gov.uk%2Fgithub_repositories)](https://operations-engineering-reports.cloud-platform.service.justice.gov.uk/github_repositories#make-recall-decision-ui)
[![CircleCI](https://circleci.com/gh/ministryofjustice/make-recall-decision-ui/tree/main.svg?style=svg)](https://circleci.com/gh/ministryofjustice/make-recall-decision-ui)

If a person on probation breaches their licence conditions, they could be recalled to prison. This service helps a probation officer to review case information and make that decision.

## Direct dependencies

- hmpps-auth - for authentication
- redis - session store and token caching
- make-recall-decision-api - main API for the app

## Running the app locally against dev env services

[Doc](./docs/setup-running.md)

## linting and typescript

[Doc](./docs/lint-typescript.md)

## Tests

[Doc](./docs/tests.md)

## Feature flags

A simple [feature flags mechanism](./docs/feature-flags.md) is available to show or hide new features.

## Deployment / configuration
- [Environment variables](./docs/env-vars.md)
- [Deployment / Helm](./docs/helm-deploy.md)

## Dependency Checks

The template project has implemented some scheduled checks to ensure that key dependencies are kept up to date.
If these are not desired in the cloned project, remove references to `check_outdated` job from `.circleci/config.yml`

## Google analytics
[Doc](./docs/analytics.md)

## Form auto-filler
[Doc](./docs/autofill-forms.md)