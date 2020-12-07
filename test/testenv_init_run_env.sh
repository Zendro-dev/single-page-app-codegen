#!/usr/bin/env bash

# Exit on error
set -e

# Load integration test constants
SCRIPT_DIR="$(dirname $(readlink -f ${BASH_SOURCE[0]}))"
source "${SCRIPT_DIR}/testenv_constants.sh"

# (Re-)Create the environment directory
mkdir -p $ENV_DIR

GRAPHQL_SERVER_INSTANCES=(
  "$GRAPHQL_SERVER_1"
  "$GRAPHQL_SERVER_2"
)

# Setup graphql server instances
for GRAPHQL_SERVER in ${GRAPHQL_SERVER_INSTANCES[@]}; do

  # Clone graphql server instance from the upstream remote, using the appropriate branch
  git clone --branch $GRAPHQL_SERVER_BRANCH https://github.com/Zendro-dev/graphql-server $GRAPHQL_SERVER

  echo $GRAPHQL_SERVER

  # Install node modules
  cd $GRAPHQL_SERVER
  NODE_JQ_SKIP_INSTALL_BINARY=true npm install
  cd - &>/dev/null

done

# Set spa server instance
git clone --branch $SPA_SERVER_BRANCH https://github.com/Zendro-dev/single-page-app.git $SPA_SERVER_1

cd $SPA_SERVER_1
npm install
npm install plotly.js
cd - &>/dev/null

# Setup the graphql server code generator
git clone --branch $GRAPHQL_CODEGEN_BRANCH https://github.com/Zendro-dev/graphql-server-model-codegen.git $GRAPHQL_CODEGEN

cd $GRAPHQL_CODEGEN
npm install
cd - &>/dev/null
