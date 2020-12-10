#!/usr/bin/env bash

# Exit on error
set -e

# Load integration test constants
SCRIPT_DIR="$(dirname $(readlink -f ${BASH_SOURCE[0]}))"
source "${SCRIPT_DIR}/testenv_constants.sh"

printBlockHeader "START" "APPLY CUSTOM PATCHES"

# Apply custom patches to the appropriate server instance
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

printBlockHeader "END" "APPLY CUSTOM PATCHES"
