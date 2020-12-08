#!/usr/bin/env bash

set -e

printCodegenTaskStart () {
  path=$1
  name=$(basename $path)
  echo -e "${GRAY}${SINGLE_SEP}${NC}\n${GREEN}START${NC} ... Generating code in ${YELLOW}${name}${NC}\n"
}

printCodegenTaskEnd () {
  path=$1
  name=$(basename $path)
  echo -e "\n${GREEN}END${NC} ... Generated code in ${YELLOW}${name}${NC}\n${GRAY}${SINGLE_SEP}${NC}"
}

cleanRepository() {

  REPO_PATH=$1
  REPO_BRANCH=$2

  cd $REPO_PATH
  echo node_modules > .gitignore
  git clean -fd &>/dev/null
  git reset --hard origin/${REPO_BRANCH} &>/dev/null
  cd - &>/dev/null

}

generateGraphqlServerCode () {

  models=$1
  output=$2

  printCodegenTaskStart $output

  node "${GRAPHQL_CODEGEN_DIR}/index.js" -f "$models" --migrations -o $output

  printCodegenTaskEnd $output

}

generateSpaCode () {

  models=$1
  output=$2

  printCodegenTaskStart $output

  node "${ROOT_DIR}/index.js" -f "$models" -o $output -P

  printCodegenTaskEnd $output

}


# Load integration test constants
SCRIPT_DIR="$(dirname $(readlink -f ${BASH_SOURCE[0]}))"
source "${SCRIPT_DIR}/testenv_constants.sh"

printBlockHeader "START" "RUN CODE GENERATORS"

# Reset the repositories to their original state and run the appropriate code generator
cleanRepository $GRAPHQL_SERVER_1 $GRAPHQL_SERVER_BRANCH
generateGraphqlServerCode "$GRAPHQL_SERVER_1_MODELS" "$GRAPHQL_SERVER_1"

cleanRepository $GRAPHQL_SERVER_2 $GRAPHQL_SERVER_BRANCH
generateGraphqlServerCode "$GRAPHQL_SERVER_2_MODELS" "$GRAPHQL_SERVER_2"

cleanRepository $SPA_SERVER_1 $SPA_SERVER_BRANCH
generateSpaCode "$GRAPHQL_SERVER_1_MODELS" "$SPA_SERVER_1"

printBlockHeader "END" "RUN CODE GENERATORS"
