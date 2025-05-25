# Reflow E2E テスト環境 (Playwright × WCAG Reflow)

> **このリポジトリは、Webサイトやアプリの「リフロー（再レイアウト）」時のアクセシビリティを自動で検証できるE2Eテスト環境です。**
> 
> WCAG 2.2「1.4.10 Reflow」基準に沿い、画面幅や文字サイズの変化・動的UI表示時に「水平スクロールが発生しない」「レイアウト崩れがない」などを自動チェックします。URLリストを用意するだけで、複数ページを一括検証できます。

<div>
    <a href="https://www.loom.com/share/993e4b85d6fb4c6ebe3cc2cf32da2bcc">
      <p>Cursor - index.html — reflow-e2e - 25 May 2025 - Watch Video</p>
    </a>
    <a href="https://www.loom.com/share/993e4b85d6fb4c6ebe3cc2cf32da2bcc">
      <img style="max-width:300px;" src="https://cdn.loom.com/sessions/thumbnails/993e4b85d6fb4c6ebe3cc2cf32da2bcc-8bdc761dd827dcd6-full-play.gif">
    </a>
  </div>

## 動作要件
- **Node.js v18 以上**  
  - `npm` / `npx` が利用できれば OK
- **(任意) [Bun](https://bun.sh/) v1.2 以上**  
  - Bun を使うとインストール・実行が高速になりますが、必須ではありません

---

## セットアップ手順

### 1. 依存パッケージのインストール
| パッケージマネージャ | コマンド |
|----------------------|----------|
| npm | `npm install` |
| Bun | `bun install` |

### 2. Playwright が使用するブラウザバイナリのインストール (初回のみ)
```bash
# npm
npx playwright install --with-deps

# Bun
bunx playwright install --with-deps
```

### 3. テスト対象 URL の登録 (`urls.txt`)
`urls.txt` にテストしたい **フルパスのURL** を 1 行につき 1 件記述してください。空行と `#` から始まる行は無視されます。

```
# 例
https://playwright.dev/
http://localhost:3000/
```

---

## テスト実行コマンド
以下のスクリプトは `package.json` に定義されています。`npm` でも `bun` でも同一の書き方で実行可能です。

| 実行内容 | コマンド |
|----------|----------|
| 通常実行 | `npm run test` / `bun run test` |
| HTML レポート生成 | `npm run test:report` / `bun run test:report` |
| GUI (Playwright UI) | `npm run test:ui` / `bun run test:ui` |
| ヘッド付きブラウザ | `npm run test:headed` / `bun run test:headed` |

> `npm` ユーザーは `npx playwright test` でも直接実行できます。

### 失敗時の出力
- HTML レポート: `playwright-report/`
- ログ・動画: `test-results/`
- スクリーンショット: `screenshots/`

---

## ローカルサーバーでの利用例
### 1. 開発サーバーがある場合 (例: Next.js)
```bash
# アプリを起動後、ブラウザでアクセス可能な URL を `urls.txt` に追加してください。
# 例: npm run dev
```
`urls.txt` には `http://localhost:3000/` のようなフルパスを追加します。

### 2. 静的 HTML のみを確認したい場合
```bash
# public ディレクトリを公開し、ブラウザでアクセス可能な URL を `urls.txt` に追加してください。
npx http-server public -p 8080
```
`urls.txt` には `http://localhost:8080/index.html` のようなフルパスを追加します。

---

## 公開リポジトリで除外すべきファイル / ディレクトリ
以下は機密情報またはビルド成果物のため Git 管理から外すことを推奨します。

- `node_modules/`, `.bun/` (依存パッケージ)
- `playwright-report/`, `test-results/`, `screenshots/` (テスト成果物)
- `*.log`, `npm-debug.log*`, `yarn-debug.log*` (ログ)
- 個人メモ: `task.txt` など

`.gitignore` に未登録の場合は追記してください。

---

## テスト仕様 (概要)
- WCAG 2.2 **1.4.10 Reflow** 達成基準に基づき、リフロー時のアクセシビリティを自動検証します。
- 主要シナリオ例:
  1. ビューポート幅 1280→320 で水平スクロールが発生しない
  2. テキストサイズ 200% 拡大時もレイアウト崩れや文字重なりがない
  3. 動的 UI (モーダル等) 表示時も Reflow 要件を満たす
- 詳細シナリオは [`test.spec.md`](./test.spec.md) を参照

## カスタマイズ
- テストロジック: [`tests/reflow.spec.ts`](./tests/reflow.spec.ts)
- URL 管理: `urls.txt`

---

## 参考リンク
- [Playwright ドキュメント](https://playwright.dev/)
- [axe-playwright](https://github.com/abhinaba-ghosh/axe-playwright)

> さらに詳細なテスト仕様は `test.spec.md` を参照してください。 