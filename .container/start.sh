#!/bin/sh

set -e

./wait-for-it.sh $WAITFOR -t 60

echo "Running migrations..."
npm run migrate

echo "Starting app..."
npm run start
