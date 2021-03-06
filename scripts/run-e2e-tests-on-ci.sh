#!/bin/bash

set -euo pipefail

npm ci --no-audit

SPECS=$(circleci tests glob e2e_tests/integration/*.feature | circleci tests split --split-by=timings | tr "\n" "," | tr " " ",")
echo "Running feature spec(s): ${SPECS}"

npx cypress run \
  --env USERNAME=${CYPRESS_USERNAME_local},PASSWORD=${CYPRESS_PASSWORD_local},CRN=${CRN_local} \
  --config-file e2e_tests/cypress.json \
  --browser chrome \
  --record false \
  --spec $SPECS

npm run e2e:report
node scripts/fix-junit-reports.js
