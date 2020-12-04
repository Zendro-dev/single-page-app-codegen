#!/usr/bin/env bash

set -e

# CONSTANTS

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
export UID="${USER_ID}:${GROUP_ID}"


# COMMAND LINE INTERFACE

NUM_ARGS=$#
DEFAULT_RUN=true

# Process command line options
if [ $# -gt 0 ]; then

  while [[ $NUM_ARGS -gt 0 ]]; do

    key="$1"
    case $key in

        -c|--cleanup)
          OPT_CLEAN_UP=true
          DEFAULT_RUN=false
        ;;

        -g|--generate-code)
          OPT_GEN_CODE=true
          DEFAULT_RUN=false
        ;;

        -h|--help)
          OPT_SHOW_MANUAL=true
          DEFAULT_RUN=false
        ;;

        -k|--keep-running)
          OPT_KEEP_RUNNING=true
        ;;

        -r|--restart-containers)
          OPT_RESTART_DOCKER=true
          DEFAULT_RUN=false
        ;;

        -t|--run-tests-only)
          OPT_RUN_TESTS=true
          DEFAULT_RUN=false
        ;;

        -T|--generate-code-and-run-tests)
          OPT_GENCODE_RUNTESTS=true
          DEFAULT_RUN=false
        ;;

        *)
          echo "Unknown option: $key"
          exit 0
        ;;
    esac

    shift
    let "NUM_ARGS--"

  done

fi


# EXECUTION
# - To improve debugging and readability, each command if fully self-contained.
# - Order of execution matters. For option compatibility, please read the manual.


# PERFORM A COMPLETE RUN
# 1. Perform a full cleanup of any pre-existing environment
# 2. Setup a new testing environment
# 3. Run the code generator and apply patches
# 4. Up the docker services
# 5. Run integration tests
# 6. Perform a full cleanup (optionally disabled)
if [[ $DEFAULT_RUN == "true" ]]; then
  # source "${TEST_DIR}/testenv_remove.sh"
  # source "${TEST_DIR}/testenv_init_run_env.sh"
  source "${TEST_DIR}/testenv_generate_code.sh"
  source "${TEST_DIR}/testenv_docker_up.sh"
  mocha "${TEST_DIR}/integration-tests-mocha.js"

  # 1. Remove docker containers, images, and volumes
  # 2. Remove the testing environment
  if [[ -z $OPT_KEEP_RUNNING ]]; then
    source "${TEST_DIR}/testenv_remove.sh"
  fi

  exit 0
fi