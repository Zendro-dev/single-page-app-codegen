FROM node:14.4.0-alpine

# Create app directory
WORKDIR /usr/src/app

# Clone the skeleton App project and install dependencies
RUN apk update && apk add git bash