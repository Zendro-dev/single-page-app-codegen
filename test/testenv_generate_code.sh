#!/usr/bin/env bash

# Exit on error
set -e

# Load integration test constants
SCRIPT_DIR="$(dirname $(readlink -f ${BASH_SOURCE[0]}))"
source "${SCRIPT_DIR}/testenv_constants.sh"

# Function to restore a repository to its original branch state
cleanRepository() {

  REPO_PATH=$1
  REPO_BRANCH=$2

  cd $REPO_PATH
  echo node_modules > .gitignore
  git clean -fd &>/dev/null
  git reset --hard origin/${REPO_BRANCH} &>/dev/null
  cd - &>/dev/null

}


# Run the graphql server code generator on each of the graphql server instances
echo ""
echo -e ${GRAY}${DOUBLE_SEP}${NC}
echo -e ${YELLOW}START ${GRAY}RUN CODE GENERATORS${NC}
echo -e ${GRAY}${DOUBLE_SEP}${NC}
echo ""

GRAPHQL_SERVER_INSTANCES=(
  "$GRAPHQL_SERVER_1"
  "$GRAPHQL_SERVER_2"
)

for i in ${!GRAPHQL_SERVER_INSTANCES[@]}; do

  GRAPHQL_SERVER=${GRAPHQL_SERVER_INSTANCES[$i]}
  INDEX=$(($i + 1))

  printf -- \
    "${SINGLE_SEP}\nGenerating code for ${YELLOW}%s${NC} ... ${GREEN}starting${NC}\n\n" \
    $(basename ${GRAPHQL_SERVER})

  # Restore the graphql server repository to a clean state
  cleanRepository $GRAPHQL_SERVER $GRAPHQL_SERVER_BRANCH

  # Run the code generator
  node "${GRAPHQL_CODEGEN}/index.js" \
    -f "${TEST_DIR}/integration_test_models_instance${INDEX}" \
    --migrations \
    -o $GRAPHQL_SERVER

  printf \
    "\nGenerating code for ${YELLOW}%s${NC} ... ${GREEN}complete${NC}\n${SINGLE_SEP}\n\n" \
    $(basename ${GRAPHQL_SERVER})

done


# Run the spa code generator on the spa instance
printf -- \
  "${SINGLE_SEP}\nGenerating code for ${YELLOW}%s${NC} ... ${GREEN}starting${NC}\n\n" \
  $(basename ${SPA_SERVER_1})

# Restore the single-page-app repository to a clean state
cd $SPA_SERVER_1
cleanRepository $SPA_SERVER_1 $SPA_SERVER_BRANCH

# Run the single-page-app code generator on the single-page-app instance
node "${ROOT_DIR}/index.js" \
  -f "${TEST_DIR}/integration_test_models_instance1" \
  -P -D \
  -o $SPA_SERVER_1

printf \
  "\nGenerating code for ${YELLOW}%s${NC} ... ${GREEN}complete${NC}\n${SINGLE_SEP}\n\n" \
  $(basename ${SPA_SERVER_1})

echo ""
echo -e ${GRAY}${DOUBLE_SEP}${NC}
echo -e ${YELLOW}END ${GRAY}RUN CODE GENERATORS${NC}
echo -e ${GRAY}${DOUBLE_SEP}${NC}
echo ""


# Apply custom patches to the appropriate server instance
echo ""
echo -e ${GRAY}${DOUBLE_SEP}${NC}
echo -e ${YELLOW}START ${GRAY}APPLY CUSTOM PATCHES${NC}
echo -e ${GRAY}${DOUBLE_SEP}${NC}
echo ""


patch \
  "${GRAPHQL_SERVER_1}/validations/with_validations.js" \
  "${TEST_DIR}/patches/with_validations.js.patch"

patch \
  "${GRAPHQL_SERVER_1}/migrateDbAndStartServer.sh" \
  "${TEST_DIR}/patches/migrateDbAndStartServer1.patch"

patch \
  "${GRAPHQL_SERVER_2}/migrateDbAndStartServer.sh" \
  "${TEST_DIR}/patches/migrateDbAndStartServer2.patch"

patch \
  "${SPA_SERVER_1}/src/acl_rules.js" \
  "${TEST_DIR}/patches/acl_rules.js.patch"

echo ""
echo -e ${GRAY}${DOUBLE_SEP}${NC}
echo -e ${YELLOW}END ${GRAY}APPLY CUSTOM PATCHES${NC}
echo -e ${GRAY}${DOUBLE_SEP}${NC}
echo ""
