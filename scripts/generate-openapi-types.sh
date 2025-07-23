#!/bin/bash

npx openapi-typescript ./docs/api/internal.yaml -o ./app/features/api/internal+.d.ts
npx eslint ./app/features/api/internal+.d.ts --fix

npx openapi-typescript ./docs/api/external.yaml -o ./app/features/api/external+.d.ts
npx eslint ./app/features/api/external+.d.ts --fix
