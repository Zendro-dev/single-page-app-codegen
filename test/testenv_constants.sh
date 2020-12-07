#!/usr/bin/env bash

# TEST_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
TEST_DIR="$(dirname $(readlink -f ${BASH_SOURCE[0]}))"
ROOT_DIR="$(dirname ${TEST_DIR})"
ENV_DIR="${TEST_DIR}/integration_test_env"

GRAPHQL_CODEGEN_BRANCH=master
GRAPHQL_CODEGEN="${ENV_DIR}/gql_server_codegen"

GRAPHQL_SERVER_BRANCH=master
GRAPHQL_SERVER_1="${ENV_DIR}/gql_science_db_graphql_server1"
GRAPHQL_SERVER_1_URL="localhost:3000/graphql"
GRAPHQL_SERVER_2="${ENV_DIR}/gql_science_db_graphql_server2"
GRAPHQL_SERVER_2_URL="localhost:3030/graphql"

SPA_SERVER_BRANCH=master
SPA_SERVER_1="${ENV_DIR}/spa_science_db_app_server1"
SPA_SERVER_1_URL="http://localhost:8080/graphql"

SERVER_CHECK_WAIT_TIME=180

USER_ID=$(id -u)
GROUP_ID=$(id -g)
DOCKER_UID="${USER_ID}:${GROUP_ID}"
