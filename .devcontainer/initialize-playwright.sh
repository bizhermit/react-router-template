#!/bin/sh

set -e

echo "node" | sudo -S npx playwright install-deps

npx playwright install
