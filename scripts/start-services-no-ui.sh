#!/bin/bash

set -euo pipefail

BUILD_HMPPS_AUTH=false
RUN_DOCKER_COMPOSE_PULL=false

instructions() {
  echo "Usage: $0 <opts>" >&2
  echo " -h --> show usage" >&2
  echo " -a --> build hmpps-auth - needed for M1 macs (default=${BUILD_HMPPS_AUTH})" >&2
  echo " -p --> run docker-compose pull (default=${RUN_DOCKER_COMPOSE_PULL})" >&2
}

while getopts ":h:ap" option; do
  case "${option}" in
  h)
    instructions
    exit 0
    ;;
  a)
    BUILD_HMPPS_AUTH=true
    ;;
  p)
    RUN_DOCKER_COMPOSE_PULL=true
    ;;
  \?)
    echo "Option '-$OPTARG' is not a valid option." >&2
    instructions
    exit 1
    ;;
  :)
    echo "Option '-$OPTARG' needs an argument." >&2
    instructions
    exit 1
    ;;
  esac
done

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly AUTH_NAME=hmpps-auth
readonly UI_NAME=make-recall-decision-ui
readonly API_NAME=make-recall-decision-api
readonly AUTH_DIR="${SCRIPT_DIR}/../../${AUTH_NAME}"
readonly UI_DIR="${SCRIPT_DIR}/../../${UI_NAME}"
readonly API_DIR="${SCRIPT_DIR}/../../${API_NAME}"
readonly API_LOGFILE="/tmp/${API_NAME}.log"

if [[ "${RUN_DOCKER_COMPOSE_PULL}" == "true" ]]; then
  printf "\n\nRunning 'docker compose pull' on all services...\n\n"
  docker-compose -f "${UI_DIR}/docker-compose.yml" pull
  docker-compose -f "${API_DIR}/docker-compose.yml" pull
fi

if [[ "${BUILD_HMPPS_AUTH}" == "true" ]]; then
  printf "\n\nBuilding hmpps-auth\n\n"
  pushd "${AUTH_DIR}"
  git pull origin main
  docker build . --tag quay.io/hmpps/hmpps-auth:latest
  popd
fi

pushd "${API_DIR}"
docker-compose stop
popd

pushd "${UI_DIR}"
docker-compose stop
docker-compose -f docker-compose-test.yml stop
printf "\n\nBuilding/starting UI components...\n\n"
docker-compose up -d redis
popd

pushd "${API_DIR}"
printf "\n\nBuilding/starting API components...\n\n"
docker-compose up -d --scale=${API_NAME}=0
./gradlew --stop
SYSTEM_CLIENT_ID=$SYSTEM_CLIENT_ID SYSTEM_CLIENT_SECRET=$SYSTEM_CLIENT_SECRET HMPPS_AUTH_URL=https://sign-in-dev.hmpps.service.justice.gov.uk/auth PROBATION_OFFENDER_SEARCH_ENDPOINT_URL=https://probation-offender-search-dev.hmpps.service.justice.gov.uk SPRING_PROFILES_ACTIVE=dev ./gradlew bootRun
popd


function wait_for {
  printf "\n\nWaiting for %s to be ready.\n\n" "${2}"
  docker run --rm --network host docker.io/jwilder/dockerize -wait "${1}" -wait-retry-interval 2s -timeout 120s
}

printf "\n\nAll services are ready.\n\n"
printf "\n\nNow start up the UI with 'npm run start:dev\n\n"
