#!/usr/bin/env bash

set -e

# playwright #

echo "node" | sudo -S npx playwright install-deps

npx playwright install
