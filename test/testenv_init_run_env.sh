#!/usr/bin/env bash

# Exit on error
set -e

# Load integration test constants
SCRIPT_DIR="$(dirname $(readlink -f ${BASH_SOURCE[0]}))"
source "${SCRIPT_DIR}/testenv_constants.sh"

echo ""
echo -e ${GRAY}${DOUBLE_SEP}${NC}
echo -e ${YELLOW}START ${GRAY}CLONE GRAPHQL AND SPA SERVER INSTANCES${NC}
echo -e ${GRAY}${DOUBLE_SEP}${NC}
echo ""

# (Re-)Create the environment directory
mkdir -p $ENV_DIR


# Setup graphql server instances
GRAPHQL_SERVER_INSTANCES=(
  "$GRAPHQL_SERVER_1"
  "$GRAPHQL_SERVER_2"
)

for GRAPHQL_SERVER in ${GRAPHQL_SERVER_INSTANCES[@]}; do

  printf -- \
    "${SINGLE_SEP}\nCloning ${YELLOW}%s${NC} into ${YELLOW}%s${NC} ... ${GREEN}starting${NC}\n\n" \
    ${GRAPHQL_SERVER_BRANCH} \
    $(basename ${GRAPHQL_SERVER})

  # Clone graphql server instance from the upstream remote, using the appropriate branch
  git clone --branch $GRAPHQL_SERVER_BRANCH https://github.com/Zendro-dev/graphql-server $GRAPHQL_SERVER

  # Install node modules
  cd $GRAPHQL_SERVER
  NODE_JQ_SKIP_INSTALL_BINARY=true npm install
  cd - &>/dev/null

  printf \
    "\nCloning branch ${YELLOW}%s${NC} into ${YELLOW}%s${NC} ... ${GREEN}complete${NC}\n${SINGLE_SEP}\n\n" \
    ${GRAPHQL_SERVER_BRANCH} \
    $(basename ${GRAPHQL_SERVER})

done


# Set spa server instance
printf -- \
  "${SINGLE_SEP}\nCloning ${YELLOW}%s${NC} into ${YELLOW}%s${NC} ... ${GREEN}starting${NC}\n\n" \
  ${SPA_SERVER_BRANCH} \
  $(basename ${SPA_SERVER_1})

git clone --branch $SPA_SERVER_BRANCH https://github.com/Zendro-dev/single-page-app.git $SPA_SERVER_1

cd $SPA_SERVER_1
npm install
cd - &>/dev/null

printf \
  "\nCloning ${YELLOW}%s${NC} into ${YELLOW}%s${NC} ... ${GREEN}complete${NC}\n${SINGLE_SEP}\n\n" \
  ${SPA_SERVER_BRANCH} \
  $(basename ${SPA_SERVER_1})


# Setup the graphql server code generator
printf -- \
  "${SINGLE_SEP}\nCloning ${YELLOW}%s${NC} into ${YELLOW}%s${NC} ... ${GREEN}starting${NC}\n\n" \
  ${GRAPHQL_CODEGEN_BRANCH} \
  $(basename ${GRAPHQL_CODEGEN})

git clone --branch $GRAPHQL_CODEGEN_BRANCH https://github.com/Zendro-dev/graphql-server-model-codegen.git $GRAPHQL_CODEGEN

cd $GRAPHQL_CODEGEN
npm install
cd - &>/dev/null

printf \
  "Cloning ${YELLOW}%s${NC} into ${YELLOW}%s${NC} ... ${GREEN}complete${NC}\n${SINGLE_SEP}\n\n" \
  ${GRAPHQL_CODEGEN_BRANCH} \
  $(basename ${GRAPHQL_CODEGEN})

echo -e ${GRAY}${DOUBLE_SEP}${NC}
echo -e ${YELLOW}END ${GRAY}CLONE GRAPHQL AND SPA SERVER INSTANCES${NC}
echo -e ${GRAY}${DOUBLE_SEP}${NC}
echo ""
