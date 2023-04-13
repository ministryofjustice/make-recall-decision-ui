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

pushd "${API_DIR}"
docker-compose stop
popd

pushd "${UI_DIR}"
docker-compose  -f docker-compose.yml  -f docker-compose-test.yml stop
printf "\n\nBuilding/starting UI components...\n\n"
docker-compose up -d --scale=${UI_NAME}=0
popd

pushd "${API_DIR}"
printf "\n\nBuilding/starting API components...\n\n"
export SPRING_PROFILES_ACTIVE=dev
docker-compose up -d --scale=${API_NAME}=0
./gradlew --stop
SPRING_PROFILES_ACTIVE=dev SYSTEM_CLIENT_ID=make-recall-decision-api SYSTEM_CLIENT_SECRET=clientsecret HMPPS_AUTH_URL=http://localhost:9090/auth OFFENDER_SEARCH_ENDPOINT_URL=http://localhost:9080 CVL_API_ENDPOINT_URL=http://localhost:9070 COMMUNITY_API_ENDPOINT_URL=http://localhost:9081 DELIUS_INTEGRATION_ENDPOINT_URL=http://localhost:9082 ARN_API_ENDPOINT_URL=http://localhost:9071 GOTENBERG_ENDPOINT_URL=http://localhost:9091 POSTGRES_HOST=localhost:5432 POSTGRES_DBNAME=make_recall_decision POSTGRES_USERNAME=mrd_user POSTGRES_PASSWORD=secret SPRING_PROFILES_ACTIVE=dev ./gradlew bootRun
popd

function wait_for {
  printf "\n\nWaiting for %s to be ready.\n\n" "${2}"
  docker run --rm --network host docker.io/jwilder/dockerize -wait "${1}" -wait-retry-interval 2s -timeout 120s
}

wait_for "http://localhost:9090/auth/health/ping" "${AUTH_NAME}"
wait_for "http://localhost:8081/health/readiness" "${API_NAME}"

printf "\n\nAll services are ready.\n\n"
