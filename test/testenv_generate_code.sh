#!/usr/bin/env bash

cleanRepository() {

  REPO_PATH=$1
  REPO_BRANCH=$2

  cd $REPO_PATH
  echo node_modules > .gitignore
  git clean -fd &>/dev/null
  git reset --hard origin/${REPO_BRANCH} &>/dev/null
  cd - &>/dev/null

}


# CODE GENERATION

GRAPHQL_SERVER_INSTANCES=(
  "$GRAPHQL_SERVER_1"
  "$GRAPHQL_SERVER_2"
)

# Run the graphql server code generator on each of the server instances
for i in ${!GRAPHQL_SERVER_INSTANCES[@]}; do

  GRAPHQL_SERVER=${GRAPHQL_SERVER_INSTANCES[$i]}
  INDEX=$(($i + 1))

  # Restore the graphql server repository to a clean state
  cleanRepository $GRAPHQL_SERVER $GRAPHQL_SERVER_BRANCH

  # Run the code generator
  node "${GRAPHQL_CODEGEN}/index.js" \
    -f "${TEST_DIR}/integration_test_models_instance${INDEX}" \
    --migrations \
    -o $GRAPHQL_SERVER

done

# Restore the single-page-app repository to a clean state
cd $SPA_SERVER_1
cleanRepository $SPA_SERVER_1 $SPA_SERVER_BRANCH

# Run the single-page-app code generator on the single-page-app instance
node "${ROOT_DIR}/index.js" \
  -f "${TEST_DIR}/integration_test_models_instance1" \
  -P -D \
  -o $SPA_SERVER_1


# PATCHES

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
