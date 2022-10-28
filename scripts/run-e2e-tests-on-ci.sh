#!/bin/bash

set -euo pipefail

npm ci --no-audit

SPECS=$(circleci tests glob e2e_tests/integration/*.feature | circleci tests split --total=3 | tr "\n" "," | tr " " ",")
echo "Running feature spec(s): ${SPECS} with parallelism: ${<< pipeline.parameters.e2e-parallelism >>}"

npx cypress run \
  --env USERNAME=${CYPRESS_USERNAME_local},PASSWORD=${CYPRESS_PASSWORD_local},CRN=${CRN_local},CRN2=${CRN2_local} \
  --config-file e2e_tests/cypress.json \
  --browser chrome \
  --record false \
  --spec $SPECS

npm run e2e:report
node scripts/fix-junit-reports.js
