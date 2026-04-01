# [Git/ブランチ運用](./index.md) - Pull Request運用

- 関連: [Commit運用](./commit.md)

## 必須記載事項

プルリクエストは[.github/pull_request_template.md](../../.github/pull_request_template.md)を**必ず（MUST）**参考に作成すること。

## テストとの関係

- テストを追加・修正した場合は明記する
- テストを追加していない場合は理由を記載する

## スコープ

- 1プルリクエストにつき、1つの目的に集中する
- 無関係なリファクタ・フォーマット変更を含めない

## コードレビュールール

- 簡潔で分かりやすい説明を心がける
- 必要に応じてコードサンプルを含める

## レビュー対応

- must 指摘は最優先で必ず対応する
- nits / imo は内容を理解したうえで対応可否を判断する
- ask には、必ず回答する

### バッジの使用

レビューの内容に応じて、以下のバッジを使用して分類する。

- 変更必須事項: ![must](https://img.shields.io/badge/review-must-darkred.svg)
- 指摘事項: ![nits](https://img.shields.io/badge/review-nits-darkgreen.svg)
- 変更任意事項: ![imo-badge](https://img.shields.io/badge/review-imo-orange.svg)
- 質問事項: ![ask](https://img.shields.io/badge/review-ask-blue.svg)
- メモ: ![badge](https://img.shields.io/badge/note-lightgray.svg)
