#!/bin/bash

set -e

#set the list of images to be removed from the docker
DELETE_IMAGES=(spa_postgres spa_science_db_graphql_server spa_science_db_app_server)
while [[ $# -gt 0 ]]
do
    key="$1"

    case $key in
        -k|--keep-image)
        DELETE_IMAGES=("${DELETE_IMAGES[@]/$2}") #+=("$2")
        shift # past argument
        shift # past value
        ;;
        *)    # unknown option
        echo "unknown option: $key"
        exit 1
        ;;
    esac
done

# Stop the GraphQL web server, delete the Docker containers and volume, but
# leave the image. Finally delete the generated code.
function cleanup {
 docker-compose -f ./docker/docker-compose-test.yml down -v

 for IMAGE in "${DELETE_IMAGES[@]}"
    do
        if ! [[ -z "${IMAGE// }" ]]; then
            IN_ID=`docker images | grep "$IMAGE"`
            if ! [[ -z "${IN_ID// }" ]]; then
             echo "Delete image: $IMAGE"
             echo "$IN_ID" | awk '{print "docker rmi -f " $3}' | sh
            fi
        fi
done

 rm -rf ./docker/integration_test_run/src
}

cleanup

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
QUERY=`cat test/integration-test.sql`
PG_CNAME=`docker-compose -f ./docker/docker-compose-test.yml ps | grep spa_postgres | awk '{ print $1 }'`

docker exec ${PG_CNAME} \
bash -c "psql -U sciencedb -d sciencedb_development -P pager=off --single-transaction --command=\"$QUERY\""



#Run the integration test suite

mocha --timeout 15000 ./test/integration-tests-mocha.js

cleanup
