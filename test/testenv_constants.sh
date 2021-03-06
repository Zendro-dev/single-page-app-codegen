#!/usr/bin/env bash

# TEST_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
TEST_DIR="$(dirname $(readlink -f ${BASH_SOURCE[0]}))"
ROOT_DIR="$(dirname ${TEST_DIR})"
ENV_DIR="${TEST_DIR}/integration_test_env"

GRAPHQL_CODEGEN_BRANCH=master
GRAPHQL_CODEGEN_DIR="${ENV_DIR}/gql_server_codegen"

GRAPHQL_SERVER_BRANCH=master
GRAPHQL_SERVER_1="${ENV_DIR}/gql_science_db_graphql_server1"
GRAPHQL_SERVER_1_MODELS="${TEST_DIR}/integration_test_models_instance1"
GRAPHQL_SERVER_1_URL="localhost:3000/graphql"
GRAPHQL_SERVER_2="${ENV_DIR}/gql_science_db_graphql_server2"
GRAPHQL_SERVER_2_MODELS="${TEST_DIR}/integration_test_models_instance2"
GRAPHQL_SERVER_2_URL="localhost:3030/graphql"

SPA_SERVER_BRANCH=master
SPA_SERVER_1="${ENV_DIR}/spa_science_db_app_server1"
SPA_SERVER_1_URL="http://localhost:8080"

SERVER_CHECK_WAIT_TIME=180

USER_ID=$(id -u)
GROUP_ID=$(id -g)
DOCKER_UID="${USER_ID}:${GROUP_ID}"

# TERMINAL OUTPUT
RED='\033[0;31m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
GRAY='\033[38;5;242m'
NC='\033[0m'

DOUBLE_SEP="=================================================================="
SINGLE_SEP="------------------------------------------------------------------"

printBlockHeader () {

  tag=$1
  message=$2

  echo ""
  echo -e ${GRAY}${DOUBLE_SEP}${NC}
  echo -e ${YELLOW}${tag} ${GRAY}${message}${NC}
  echo -e ${GRAY}${DOUBLE_SEP}${NC}
  echo ""

}
