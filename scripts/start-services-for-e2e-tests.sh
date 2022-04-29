#!/bin/bash

set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

readonly UI_NAME=make-recall-decision-ui
readonly API_NAME=make-recall-decision-api
readonly UI_DIR="${SCRIPT_DIR}/../../${UI_NAME}"
readonly API_DIR="${SCRIPT_DIR}/../../${API_NAME}"

pushd "${API_DIR}"
printf "\n\nBuilding/starting API components...\n\n"
docker-compose pull
docker-compose build
docker-compose up -d
popd

pushd "${UI_DIR}"
printf "\n\nBuilding/starting UI components...\n\n"
docker-compose pull
docker-compose build
docker-compose up -d
popd

function wait_for {
  printf "\n\nWaiting for %s to be ready.\n\n" "${2}"
  docker run --rm --network host docker.io/jwilder/dockerize -wait "${1}" -wait-retry-interval 2s -timeout 60s
}

wait_for "http://localhost:9090/auth/health/ping" "hmpps-auth"
wait_for "http://localhost:3000/ping" "make-recall-decision-ui"
wait_for "http://localhost:8080/health/readiness" "make-recall-decision-api"

printf "\n\nAll services are ready.\n\n"
