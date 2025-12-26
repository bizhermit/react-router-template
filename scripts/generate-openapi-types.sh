#!/bin/bash

npx openapi-typescript ./docs/api/internal.yaml -o ./src/app/features/common/api/internal+.d.ts && \
npx eslint ./src/app/features/common/api/internal+.d.ts --fix & \
npx openapi-typescript ./docs/api/external.yaml -o ./src/app/features/common/api/external+.d.ts && \
npx eslint ./src/app/features/common/api/external+.d.ts --fix

wait
