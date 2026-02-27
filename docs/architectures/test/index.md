# [アーキテクチャ](../index.md) - テスト仕様

- [ユニットテスト](./unit-test.md)
- [インテグレーションテスト](./integration-test.md)
- [コンポーネントテスト](./component-test.md)
- [E2Eテスト](./e2e-test.md)

## CI とテスト種別の対応

| テスト種別         | CI での実行コマンド / タスク                                  | 参照ドキュメント                                  |
| ------------------ | ------------------------------------------------------------- | ------------------------------------------------- |
| ユニット           | `npm run test` / `npx vitest run`                             | [ユニットテスト](./unit-test.md)                  |
| インテグレーション | `npm run test`（対象ファイルを `vitest --run <path>` で指定） | [インテグレーションテスト](./integration-test.md) |
| コンポーネント     | `npm run test`（`vitest` の DOM モード）                      | [コンポーネントテスト](./component-test.md)       |
| E2E                | `npm run playwright`                                          | [E2Eテスト](./e2e-test.md)                        |

- CI 上では `npm run test` がユニット/インテグレーション/コンポーネントを包括的に実行する。対象外のテスト種別を追加する際はタスク分割を検討する。
- E2E は Playwright 専用パイプラインで実行し、`Start WebApp(dev)` などのサーバー起動タスク後に `npm run playwright` を叩く。
