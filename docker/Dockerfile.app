FROM node:11.6.0-alpine

# Create app directory
WORKDIR /usr/src/app

# Clone the skeleton App project and install dependencies
RUN apk update && \
 apk add git && apk add bash && \
 git clone https://github.com/ScienceDb/single-page-app.git . && \
 npm install npm@6.0.0


# Copy generated files for App
COPY ./integration_test_run/src/components/* ./src/components/
COPY ./integration_test_run/src/router/* ./src/router/
COPY ./integration_test_run/src/requests/* ./src/requests/
COPY ./integration_test_run/src/sciencedb-globals.js ./src/
