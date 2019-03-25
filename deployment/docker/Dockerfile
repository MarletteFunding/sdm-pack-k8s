FROM node:8-alpine

LABEL maintainer="Marlette Atomist Bot<servicing-platform@bestegg.com>"

RUN apk add dumb-init

RUN mkdir -p /opt/app
WORKDIR /opt/app

EXPOSE 80

ENV BLUEBIRD_WARNINGS 0
ENV NPM_CONFIG_LOGLEVEL warn
ENV SUPPRESS_NO_CONFIG_WARNING true

ENTRYPOINT [ "dumb-init", "node", "--trace-warnings", "--expose_gc", "--optimize_for_size", "--always_compact", "--max_old_space_size=384" ]

# Install container dependencies
RUN apk add --update --virtual build-dependencies\
    build-base \
    gcc \
    git \
    curl \
    docker \
    && rm -rf /var/lib/apt/lists/*

# Configure git
RUN git config --global user.email "servicing-platform@bestegg.com" \
    &&  git config --global user.name "Marlette Atomist Bot"

# Update npm
RUN npm i -g npm@6.1.0

# Install Kubectl
RUN curl -sL -o /usr/local/bin/kubectl https://storage.googleapis.com/kubernetes-release/release/v1.8.12/bin/linux/amd64/kubectl \
    && chmod +x /usr/local/bin/kubectl \
    && kubectl version --client

# Install app dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Bundle app source
COPY . .

RUN npm run build


# Start Atomist
CMD [ "/opt/app/node_modules/.bin/npm", "start" ]
