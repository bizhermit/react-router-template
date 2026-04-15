#!/bin/bash

# openapi-typescript@7.13.0 は peer に typescript ^5.x を要求するため、
# TypeScript 6.0.2 以降と npm 依存として共存できない。
# そのため直接依存には含めず、ここでバージョンを固定して実行している。
# openapi-typescript が TypeScript 6 に正式対応した時点で、
# package.json の devDependencies に戻し、バージョン固定指定を外すこと。
npx --yes openapi-typescript@7.13.0 ./docs/api/internal.yaml -o ./src/features/api/shared/internal+.d.ts && \
npx eslint ./src/features/api/shared/internal+.d.ts --fix & \
npx --yes openapi-typescript@7.13.0 ./docs/api/external.yaml -o ./src/features/api/shared/external+.d.ts && \
npx eslint ./src/features/api/shared/external+.d.ts --fix

wait
