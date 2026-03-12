FROM node:24-bookworm

WORKDIR /workspace

ARG WORKSPACE_DIRS="node_modules .react-router .artifacts"

RUN apt-get update -y \
  # && apt-get upgrade -y \
  # && apt-get install -y --no-install-recommends \
  # sudo \
  && apt-get -y clean \
  && rm -rf /var/lib/apt/lists/*

RUN for dir in $WORKSPACE_DIRS; do mkdir -p "/workspace/$dir"; done \
  && chown -R node:node /workspace

USER node
