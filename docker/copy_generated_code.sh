#!/bin/bash

# -------------------------------------------------------------------------------------
# copy_generated_code.sh
#
# Copy generated files mapped on ./generated directory, to the corresponding
# graphql server directories.
#

TARGET_DIRS=(
              "schemas" \
              "resolvers" \
              "models/sql" \
              "models/adapters" \
              "migrations" \
              "validations" \
              "patches")
GENERATED_CODE_DIR="./generated"
RED='\033[0;31m'
LGREEN='\033[1;32m'
YEL='\033[1;33m'
LGRAY='\033[38;5;242m'
NC='\033[0m'

#
# Delete current generated code, except skeleton pregenerated files, 
# and then copy generated code.
#
# Msg
echo -e "\n${LGRAY}@@ ----------------------------${NC}"
echo -e "${LGRAY}@@ Copy generated code...${NC}"

for i in "${TARGET_DIRS[@]}"
do
  if [ -d ./${i} ]; then
    
    #remove
    find ./${i} -type f \! -name '20200715195822-role\.js' \! -name 'role\.js' \! -name '20200715195823-role_to_user\.js' \! -name 'role_to_user\.js' \! -name '20200715195823-user\.js' \! -name 'user\.js' \! -name 'index\.js' -exec rm -vrf '{}' \;
    if [ $? -eq 0 ]; then
        echo -e "@ Removed content in: ${i} ... ${LGREEN}done${NC}"
    else
        echo -e "!!${RED}ERROR${NC}: trying to remove content in: ${RED}${i}${NC} fails ... ${YEL}exit${NC}"
        exit 0
    fi

    #copy
    cp -r ${GENERATED_CODE_DIR}/${i}/* ./${i}/  
    if [ $? -eq 0 ]; then
        echo -e "@ Copied generated code into: ./${i} ... ${LGREEN}done${NC}"
    else
        echo -e "!!${RED}ERROR${NC}: trying to copy generated code into: ${RED}./${i}${NC} fails ... ${YEL}exit${NC}"
        exit 0
    fi
  fi
done

# Msg
echo -e "@@ All generated code copied ... ${LGREEN}done${NC}"
echo -e "${LGRAY}---------------------------- @@${NC}\n"
