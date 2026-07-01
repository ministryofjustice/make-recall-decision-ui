#!/bin/bash
set -euo pipefail

# Ensure these are all still being used

readonly UI_NAME=make-recall-decision-ui
readonly API_NAME=make-recall-decision-api
readonly AUTH_NAME=hmpps-auth

# readonly AUTH_DIR="${SCRIPT_DIR}/../../${AUTH_NAME}"
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly UI_DIR="${SCRIPT_DIR}/../../${UI_NAME}"
readonly API_DIR="${SCRIPT_DIR}/../../${API_NAME}"

printf "\n\nRunning 'docker compose pull' on all services...\n\n"
docker compose -f "${UI_DIR}/docker-compose.yml" pull
docker compose -f "${API_DIR}/docker-compose.yml" pull

pushd "${API_DIR}"
printf "\n\nBuilding/starting API components...\n\n"
export SPRING_PROFILES_ACTIVE=dev,seed-test-data
export POSTGRES_OPTIONS=sslmode=disable
docker compose build
docker compose up -d
popd

pushd "${UI_DIR}"
printf "\n\nBuilding/starting UI components...\n\n"
export USE_LOCAL_HEADER_FALLBACKS=true
docker compose build
docker compose up -d
popd

function wait_for {
  printf "\n\nWaiting for %s to be ready.\n\n" "${2}"
  docker run --rm --network host docker.io/jwilder/dockerize -wait "${1}" -wait-retry-interval 2s -timeout 120s
}

wait_for "http://localhost:9090/auth/health/ping" "${AUTH_NAME}"
wait_for "http://localhost:3000/ping" "${UI_NAME}"
wait_for "http://localhost:8080/health/readiness" "${API_NAME}"

printf "\n\nAll services are ready.\n\n"
