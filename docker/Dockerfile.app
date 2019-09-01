FROM node:11.6.0-alpine

# Create app directory
WORKDIR /usr/src/app

# Clone the skeleton App project and install dependencies
RUN apk update && \
 apk add git && apk add bash && \
 git clone https://github.com/ScienceDb/single-page-app.git . && \
 npm install
