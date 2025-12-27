#!/bin/bash

npx openapi-typescript ./docs/api/internal.yaml -o ./src/features/api/shared/internal+.d.ts && \
npx eslint ./src/features/api/shared/internal+.d.ts --fix & \
npx openapi-typescript ./docs/api/external.yaml -o ./src/features/api/shared/external+.d.ts && \
npx eslint ./src/features/api/shared/external+.d.ts --fix

wait
