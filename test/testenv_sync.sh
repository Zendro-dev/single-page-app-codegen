#!/usr/bin/env bash

# Exit on error
set -e

# Load integration test constants
SCRIPT_DIR="$(dirname $(readlink -f ${BASH_SOURCE[0]}))"
source "${SCRIPT_DIR}/testenv_constants.sh"

echo ""
echo -e ${GRAY}${DOUBLE_SEP}${NC}
echo -e ${YELLOW}START ${GRAY}APPLY CUSTOM PATCHES${NC}
echo -e ${GRAY}${DOUBLE_SEP}${NC}
echo ""

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

echo ""
echo -e ${GRAY}${DOUBLE_SEP}${NC}
echo -e ${YELLOW}END ${GRAY}APPLY CUSTOM PATCHES${NC}
echo -e ${GRAY}${DOUBLE_SEP}${NC}
echo ""
