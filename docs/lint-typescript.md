# Linting and Typescript

## Pre-commit hooks
After `npm run setup`, files will be created under both .git/hooks and .husky, that will automatically lint (and fix) any staged files in your commits, plus run a type check.

## Typescript definitions for make-recall-decision-api
Generated from [make-recall-decision-api Swagger](https://make-recall-decision-api-dev.hmpps.service.justice.gov.uk/swagger-ui/index.html).

```
npm run swagger-to-ts
```

Note - you should be connected to the VPN when running this script, or it won't be authorized to hit the Swagger endpoint.

Types are output to `./server/@types/make-recall-decision-api`.

## Typescript check

To run a Typescript compilation check:
```
npm run typecheck
```

## Run linter and fix issues

```
npm run lint:fix
```
