#!/bin/sh

set -e

./wait-for-it.sh $WAITFOR

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Starting app..."
npm run start
