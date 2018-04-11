FROM node

# Metadata
LABEL org.label-schema.vendor="Neufund" \
      org.label-schema.url="https://neufund.org" \
      org.label-schema.name="Platform Contracts" \
      org.label-schema.description="Platform smart contract and build + deploy pipeline" \
      org.label-schema.version="0.0.1" \
      org.label-schema.vcs-url="https://github.com/Neufund/platform-contracts" \
      org.label-schema.docker.schema-version="1.0"

RUN mkdir -p /usr/src/platform-contracts
WORKDIR /usr/src/platform-contracts
ADD .babelrc mocha.js nanoWeb3Provider.js package.json truffle.js ./
RUN yarn
ADD contracts contracts
ADD legal legal
ADD migrations migrations
ADD scripts scripts
RUN mkdir -p build && mkdir -p test
ADD test/helpers test/helpers