#!/bin/sh

set -e

apt-get update -y
apt-get upgrade -y
apt-get install -y --no-install-recommends \
  fonts-noto-cjk \
  fonts-mplus \
  fonts-ipafont-gothic \
  fonts-ipafont-mincho

apt-get clean

rm -rf /var/lib/apt/lists/*

echo "node" | sudo -S npx playwright install-deps

npx playwright install
