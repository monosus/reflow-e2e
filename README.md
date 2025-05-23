# Reflow E2E テスト環境構築手順

## 必要要件
- [Bun](https://bun.sh/) v1.0 以降
- Node.js v18 以降（Playwright の一部機能で必要な場合あり）

## セットアップ手順

1. 依存パッケージのインストール

```bash
bun install
bunx playwright install --with-deps
```

2. .env ファイルの作成

`.env` ファイルをプロジェクトルートに作成し、下記のように記載してください。

```
BASE_URL=https://your-app.example.com
```

3. テストの実行

```bash
bunx playwright test
```

- HTML レポート生成:

```bash
bunx playwright test --reporter=html
```

## 参考
- [Playwright ドキュメント](https://playwright.dev/)
- [axe-playwright](https://github.com/abhinaba-ghosh/axe-playwright)

---

> 詳細なテスト仕様やシナリオは `test.spec.md` を参照してください。 