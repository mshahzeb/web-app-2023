
FROM node:lts

WORKDIR /src
# Expose the port 3000
EXPOSE 3000
# Install and configure `serve`.
RUN npm install -g serve
# Install app dependencies
COPY package.json /src
COPY package-lock.json /src
RUN npm ci --verbose
# Copy your code in the docker image
COPY . /src
RUN npm ci --verbose
RUN npm run build

# Build app and start server from script
CMD ["serve", "-s", "build"]