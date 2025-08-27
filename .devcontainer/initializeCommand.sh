#!/bin/bash

set -eu

# # 外部ネットワーク構築 #

# EXTERNAL_NETWORK_NAME="template-external-dev"

# if ! docker network inspect "$EXTERNAL_NETWORK_NAME" >/dev/null 2>&1; then
#   echo "Create external network: $EXTERNAL_NETWORK_NAME"
#   docker network create "$EXTERNAL_NETWORK_NAME"
# fi
