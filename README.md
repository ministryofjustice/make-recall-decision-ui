# UI for "Decide if someone should be recalled or not" (`make-recall-decision-ui`)

[![CircleCI](https://dl.circleci.com/status-badge/img/gh/ministryofjustice/make-recall-decision-ui/tree/main.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/ministryofjustice/make-recall-decision-ui/tree/main)

If a person on probation breaches their licence conditions, they could be recalled to prison. This service helps a probation officer to review case information and make the decision to recall or not.
Read more on the [Confluence space](https://dsdmoj.atlassian.net/wiki/spaces/MRD/overview).

## Running the app locally
* [Setup and running](./docs/setup-running.md)
* [User access](./docs/user-access.md)

## Development
[Guide on developing new features](./docs/developing-new-features.md)

* [Service dependencies](./docs/service-dependencies.md)
* [Linting and typescript](./docs/lint-typescript.md)
* [Unit, integration & accessibility tests](./docs/tests.md)
* [E2E tests](./docs/e2e-tests.md)
* [Feature flags](./docs/feature-flags.md)
* [Analytics](./docs/analytics.md)
* [Form auto-filler](./docs/autofill-forms.md)

## Support / deployment / configuration
* [Environment variables](./docs/env-vars.md) - including notes on changing secrets
* [NPM dependency Checks](./docs/npm-dependency-checks.md)
* [Deployment / Helm](./docs/helm-deploy.md) - including how to roll back a deployment
* [Runbook](./RUNBOOK.md)

### Dashboards
* MI dashboard (AppInsights) - useful if you want to see the user activity for a given CRN
  * [Prod](https://portal.azure.com/#@nomsdigitechoutlook.onmicrosoft.com/dashboard/arm/subscriptions/a5ddf257-3b21-4ba9-a28c-ab30f751b383/resourcegroups/dashboards/providers/microsoft.portal/dashboards/302220ae-7f13-458d-9149-9c9b40cf6465)
  * [Preprod](https://portal.azure.com/#@nomsdigitechoutlook.onmicrosoft.com/dashboard/arm/subscriptions/a5ddf257-3b21-4ba9-a28c-ab30f751b383/resourcegroups/dashboards/providers/microsoft.portal/dashboards/302220ae-7f13-458d-9149-9c9b40cf656d)
* Developer dashboard (AppInsights)
  * [Prod](https://portal.azure.com/#@nomsdigitechoutlook.onmicrosoft.com/dashboard/arm/subscriptions/a5ddf257-3b21-4ba9-a28c-ab30f751b383/resourcegroups/dashboards/providers/microsoft.portal/dashboards/c920c355-b321-4048-8795-230b9c5a2728)
  * [Preprod](https://portal.azure.com/#@nomsdigitechoutlook.onmicrosoft.com/dashboard/arm/subscriptions/a5ddf257-3b21-4ba9-a28c-ab30f751b383/resourcegroups/dashboards/providers/microsoft.portal/dashboards/c920c355-b321-4048-8795-230b9c5a24b2)
* [Monitoring & operability (Confluence)](https://dsdmoj.atlassian.net/wiki/spaces/MRD/pages/3987210241/Monitoring+Operability)