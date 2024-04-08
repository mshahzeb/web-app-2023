
FROM node:lts

WORKDIR /src
# Expose the port 3000
EXPOSE 3000
# Set the default command to run when a container starts
CMD ["npm", "start"]
# Install app dependencies
COPY package.json /src
COPY package-lock.json /src
RUN npm ci --verbose
# Copy your code in the docker image
COPY . /src