#!/usr/bin/env bash

set -e

printCloneTaskStart () {
  branch=$1
  name=$2
  echo -e "${GRAY}${SINGLE_SEP}${NC}\n${GREEN}START${NC} ... Cloning ${YELLOW}${branch}${NC} into ${YELLOW}${name}${NC}\n"
}

printCloneTaskEnd () {
  branch=$1
  name=$2
  echo -e "\n${GREEN}END${NC} ... Cloned ${YELLOW}${branch}${NC} into ${YELLOW}${name}${NC}\n${GRAY}${SINGLE_SEP}${NC}"
}

cloneAndInstallRepository () {

  repository=$1
  branch=$2
  outpath=$3
  name=$(basename $outpath)

  printCloneTaskStart "master" "$name"

  # Clone graphql server instance from the upstream remote, using the appropriate branch
  git clone --branch $branch $repository $outpath

  # Install node modules
  cd $outpath
  NODE_JQ_SKIP_INSTALL_BINARY=true npm install
  cd - &>/dev/null

  printCloneTaskEnd "master" "$name"

}

# Load integration test constants
SCRIPT_DIR="$(dirname $(readlink -f ${BASH_SOURCE[0]}))"
source "${SCRIPT_DIR}/testenv_constants.sh"

printBlockHeader "START" "CLONE GRAPHQL AND SPA SERVER INSTANCES"

# (Re-)Create the environment directory
mkdir -p $ENV_DIR

# Setup graphql server instances
graphql_server_repository="https://github.com/Zendro-dev/graphql-server"
cloneAndInstallRepository $graphql_server_repository $GRAPHQL_SERVER_BRANCH $GRAPHQL_SERVER_1
cloneAndInstallRepository $graphql_server_repository $GRAPHQL_SERVER_BRANCH $GRAPHQL_SERVER_2

# Setup spa server instance
spa_repository="https://github.com/Zendro-dev/single-page-app.git"
cloneAndInstallRepository $spa_repository $SPA_SERVER_BRANCH $SPA_SERVER_1

# Setup the graphql server code generator
graphql_server_codegen_repository="https://github.com/Zendro-dev/graphql-server-model-codegen.git"
cloneAndInstallRepository $graphql_server_codegen_repository $GRAPHQL_CODEGEN_BRANCH $GRAPHQL_CODEGEN_DIR

printBlockHeader "END" "CLONE GRAPHQL AND SPA SERVER INSTANCES"
