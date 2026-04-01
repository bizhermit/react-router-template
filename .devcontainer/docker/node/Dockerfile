FROM node:24-bookworm

WORKDIR /workspace

ARG HOST_UID=1000
ARG HOST_GID=1000
ARG WORKSPACE_DIRS="node_modules .react-router .artifacts"

# RUN apt-get update -y \
#   && apt-get upgrade -y \
#   # && apt-get install -y --no-install-recommends \
#   # sudo \
#   && apt-get -y clean \
#   && rm -rf /var/lib/apt/lists/*

RUN groupmod -og $HOST_GID node \
  && usermod -ou $HOST_UID node

RUN for dir in $WORKSPACE_DIRS; do mkdir -p "/workspace/$dir"; done \
  && chown -R node:node /workspace

USER node
