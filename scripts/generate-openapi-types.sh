#!/bin/bash

npx openapi-typescript ./docs/api/internal.yaml -o ./src/features/shared/api/internal+.d.ts && \
npx eslint ./src/features/shared/api/internal+.d.ts --fix & \
npx openapi-typescript ./docs/api/external.yaml -o ./src/features/shared/api/external+.d.ts && \
npx eslint ./src/features/shared/api/external+.d.ts --fix

wait
