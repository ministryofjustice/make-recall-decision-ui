# UI for "Decide if someone should be recalled or not" (`make-recall-decision-ui`)

[![CircleCI](https://dl.circleci.com/status-badge/img/gh/ministryofjustice/make-recall-decision-ui/tree/main.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/ministryofjustice/make-recall-decision-ui/tree/main)

If a person on probation breaches their licence conditions, they could be recalled to prison. This service helps a
probation officer to review case information and make the decision to recall or not.
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

### Notification info box

* Display a notification info box on the homepage to make users aware of any planned outages four environment variables
  are required. These are available for each environment in the helm_deploy folder -
    * **NOTIFICATION_HEADER** - optional header of the banner
    * **NOTIFICATION_BODY** - mandatory text in the body of the banner. This must conform to GDS
      standards [see link](https://design-system.service.gov.uk/components/notification-banner/)
    * **NOTIFICATION_BANNER_START_DATE_TIME** - must be written in ISO format eg/YYYY-MM-DDTHH:MM:SS, the banner will
      only be
      displayed **_on or after_** this date and time
    * **NOTIFICATION_BANNER_END_DATE_TIME** - must be written in ISO format eg/YYYY-MM-DDTHH:MM:SS, the banner will only
      be displayed
      **_on or before_** this date and time

### Maintenance Banner

* To prevent access to the user interface display a maintenance page when the user logs on during any planned outages;
  three environment variables are required. These are available for each environment in the helm_deploy folder -
    * **MAINTENANCE_PAGE_BODY** - optional text in body of the banner, this does not need to include the dates and times
      of the outage since these will be automatically added using the MAINTENANCE_PAGE_START_DATE_TIME and
      MAINTENANCE_PAGE_END_DATE_TIME fields
    * **MAINTENANCE_PAGE_START_DATE_TIME** - must be written in ISO format eg/YYYY-MM-DDTHH:MM:SS, the banner will only
      be displayed **_on or after_** this date and time
    * **MAINTENANCE_PAGE_END_DATE_TIME** - must be written in ISO format eg/YYYY-MM-DDTHH:MM:SS, the banner will only be
      displayed **_on or before_** this date and time

### Dashboards

* MI dashboard (AppInsights) - useful if you want to see the user activity for a given CRN
    * [Prod](https://portal.azure.com/#@nomsdigitechoutlook.onmicrosoft.com/dashboard/arm/subscriptions/a5ddf257-3b21-4ba9-a28c-ab30f751b383/resourcegroups/dashboards/providers/microsoft.portal/dashboards/302220ae-7f13-458d-9149-9c9b40cf6465)
    * [Preprod](https://portal.azure.com/#@nomsdigitechoutlook.onmicrosoft.com/dashboard/arm/subscriptions/a5ddf257-3b21-4ba9-a28c-ab30f751b383/resourcegroups/dashboards/providers/microsoft.portal/dashboards/302220ae-7f13-458d-9149-9c9b40cf656d)
* Developer dashboard (AppInsights)
    * [Prod](https://portal.azure.com/#@nomsdigitechoutlook.onmicrosoft.com/dashboard/arm/subscriptions/a5ddf257-3b21-4ba9-a28c-ab30f751b383/resourcegroups/dashboards/providers/microsoft.portal/dashboards/c920c355-b321-4048-8795-230b9c5a2728)
    * [Preprod](https://portal.azure.com/#@nomsdigitechoutlook.onmicrosoft.com/dashboard/arm/subscriptions/a5ddf257-3b21-4ba9-a28c-ab30f751b383/resourcegroups/dashboards/providers/microsoft.portal/dashboards/c920c355-b321-4048-8795-230b9c5a24b2)
* [Monitoring & operability (Confluence)](https://dsdmoj.atlassian.net/wiki/spaces/MRD/pages/3987210241/Monitoring+Operability)