#!/usr/bin/env bash

# Exit on error
set -e

# Load integration test constants
SCRIPT_DIR="$(dirname $(readlink -f ${BASH_SOURCE[0]}))"
source "${SCRIPT_DIR}/testenv_constants.sh"

# Function to verify that all docker servies are ready to take requests
checkGqlServer() {

  url="${1}"
  max_time="${2}"

  elapsedTime=0
  until curl "$url" &>/dev/null
  do

    # Exit with error code 1
    if [ $elapsedTime == $max_time ]; then

      echo "time limit reached while waiting for ${url}"
      return 1

    fi

    # Wait 2s and rety
    sleep 2
    elapsedTime=$(expr $elapsedTime + 2)
  done

  echo -e ${YELLOW}$url${NC} is ${GREEN}ready${NC}

  return 0

}

# Up detached docker containers
export DOCKER_UID="$DOCKER_UID"
docker-compose \
  -f "${TEST_DIR}/integration_test_misc/docker-compose-test.yml" up -d \
  --force-recreate \
  --remove-orphans \
  --renew-anon-volumes

# Wait for the server instances to get ready
echo "Waiting for all servers to start"

HOSTS=(
  $GRAPHQL_SERVER_1_URL
  $GRAPHQL_SERVER_2_URL
  $SPA_SERVER_1_URL
)
pids=( )

for url in ${HOSTS[@]}; do

  checkGqlServer $url $SERVER_CHECK_WAIT_TIME &
  pids+="$! "

done

# Wait until all servers are up and running
for id in ${pids[@]}; do

  wait $id || exit 0

done
