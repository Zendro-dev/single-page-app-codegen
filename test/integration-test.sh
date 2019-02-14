#!/bin/bash

set -e

# Stop the GraphQL web server, delete the Docker containers and volume, but
# leave the image. Finally delete the generated code.
function cleanup {
 docker-compose -f ./docker/docker-compose-test.yml down -v && \
    rm -rf ./docker/integration_test_run/src
}



# Create folders required by App code generator
mkdir -p ./docker/integration_test_run/src/components
mkdir -p ./docker/integration_test_run/src/router
mkdir -p ./docker/integration_test_run/src/requests

# Generate App code for the integration test models
node ./index.js --jsonFiles ./test/integration-test-input/ ./docker/integration_test_run/

# Prepare integration tests input to generate code on the GraphQL server
cp -r ./test/integration-test-input ./docker/integration_test_run/src/

# Setup and launch all three servers: PostgreSQL, GraphQL and App
docker-compose -f ./docker/docker-compose-test.yml up -d

# Wait until the Science-DB GraphQL web-server is up and running
waited=0
until curl 'localhost:3000/graphql' > /dev/null 2>&1
do
  if [ $waited == 240 ]; then
    echo -e '\nERROR: While awaiting dockerized start-up of the Science-DB GraphQL web server, the time out limit was reached.\n'
    cleanup
    exit 1
  fi
  sleep 2
  waited=$(expr $waited + 2)
done

# Add tests-specific data into the database
QUERY=`cat test/integration_test.sql`
PG_CNAME=`docker-compose -f ./docker/docker-compose-test.yml ps | grep spa_postgres | awk '{ print $1 }'`

docker exec ${PG_CNAME} \
bash -c "psql -U sciencedb -d sciencedb_development -P pager=off --single-transaction --command=\"$QUERY\""



#Run the integration test suite

#mocha --timeout 15000 ./test/integration-tests-mocha.js

#cleanup
