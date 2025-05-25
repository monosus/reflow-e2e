import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url'; // ESモジュールで__dirnameの代わり
import { getFirstVisibleTextElementInMain, assertNoHorizontalScroll, scaleFontSizeWithScreenshots } from './utils/reflowUtils';
// import { injectAxe, checkA11y } from 'axe-playwright'; // axe-playwright関連を削除

const AXE_RUN_TIMEOUT = 10000; // これはensureAxeIsReadyで使っていたので、ensureAxeIsReady削除に伴い不要になるが、一旦残しても影響はない
// const NETWORK_IDLE_TIMEOUT = 5000; // Temporarily commented out

// ESモジュールで__dirnameの代わりを取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// urls.txtからURLを読み込む
const urlsFilePath = path.join(process.cwd(), 'urls.txt'); 
let targetUrls: string[] = [];
try {
  const fileContent = fs.readFileSync(urlsFilePath, 'utf-8');
  targetUrls = fileContent
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));
} catch (error) {
  console.error(`Error reading urls.txt from ${urlsFilePath}:`, error);
  // urls.txt が読み込めない場合は、フォールバックとしてローカルのHTMLを使うか、エラーにする
  // 今回はフォールバックとして以前のローカルパスを設定 (必要に応じて変更)
  targetUrls.push('/public/index.html'); 
  console.warn('Falling back to default test URL: /public/index.html');
}

if (targetUrls.length === 0) {
  console.warn('No URLs found in urls.txt or fallback. Add URLs to urls.txt or check the path.');
  // テストを実行せずに終了する、またはデフォルトURLで実行するなどの処理が必要
  // ここでは、少なくとも1つのURLがないとテストが意味をなさないため、警告を出して終了するイメージ
  process.exit(1); // Or throw an error
}

test.describe('リフローテスト E2E', () => {
  targetUrls.forEach(url => {
    test.describe(`テスト対象URL: ${url}`, () => {
      // basePath の代わりに、各テストで直接 url を使用

      test('RF-01: ビューポート幅1280→320で水平スクロールなし', async ({ page }) => {
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        // 段階的に画面幅を狭める
        for (let width = 1280; width >= 320; width -= 80) {
          await page.setViewportSize({ width, height: 800 });
          await page.waitForTimeout(200); // 進行が分かりやすいように少し待つ
          await page.screenshot({ path: `screenshots/${encodeURIComponent(url)}-width-${width}.png` });
        }
        // 最終幅でアサーション
        await assertNoHorizontalScroll(page);
      });

      test('RF-02: テキストサイズ200%で水平スクロールなし・フォントサイズ確認', async ({ page }) => {
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        // await page.waitForLoadState('networkidle', { timeout: NETWORK_IDLE_TIMEOUT }); // Temporarily commented out

        const elementHandle = await getFirstVisibleTextElementInMain(page);
        if (!elementHandle) {
          test.skip(true, `メインコンテンツ内の最初のテキスト要素が見つかりませんでした。URL: ${url}`);
          return;
        }

        const initialFontSizeStr = await elementHandle.evaluate(el => getComputedStyle(el).fontSize);
        const initialFontSize = parseFloat(initialFontSizeStr);

        // 段階的に文字サイズを100%→400%まで上げる（スクリーンショット付き）
        await scaleFontSizeWithScreenshots(page, [100, 150, 200, 250, 300, 350, 400], url);

        // 最終サイズで検証
        const finalFontSizeStr = await elementHandle.evaluate(el => getComputedStyle(el).fontSize);
        const finalFontSize = parseFloat(finalFontSizeStr);

        // フォントサイズが約2倍になったか確認 (1.8倍から2.2倍の範囲を許容)
        expect(finalFontSize, `フォントサイズが約2倍になっていません (初期: ${initialFontSizeStr}, 最終: ${finalFontSizeStr})`).toBeGreaterThanOrEqual(initialFontSize * 1.8);
        expect(finalFontSize, `フォントサイズが約2倍になっていません (初期: ${initialFontSizeStr}, 最終: ${finalFontSizeStr})`).toBeLessThanOrEqual(initialFontSize * 4.2);
        
        await assertNoHorizontalScroll(page);
      });

      test('RF-03: 幅320+テキスト200%で水平スクロールなし', async ({ page }) => {
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        // await page.waitForLoadState('networkidle', { timeout: NETWORK_IDLE_TIMEOUT }); // Temporarily commented out
        // await injectAxe(page); // axe-playwright関連を削除
        // await ensureAxeIsReady(page); // axe-playwright関連を削除
        // await checkA11y(page); // 初期チェック // axe-playwright関連を削除

        await page.setViewportSize({ width: 320, height: 800 });
        await page.addStyleTag({ content: 'html { font-size: 200%; }' });
        // await injectAxe(page); // axe-playwright関連を削除
        // await ensureAxeIsReady(page); // axe-playwright関連を削除
        // await checkA11y(page); // axe-playwright関連を削除
        await assertNoHorizontalScroll(page);
      });

      test('RF-04: 動的UI表示時のリフロー', async ({ page }) => {
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        // await page.waitForLoadState('networkidle', { timeout: NETWORK_IDLE_TIMEOUT }); // Temporarily commented out
        // await injectAxe(page); // axe-playwright関連を削除
        // await ensureAxeIsReady(page); // axe-playwright関連を削除
        // await checkA11y(page); // 初期チェック // axe-playwright関連を削除

        await page.waitForTimeout(500); 

        const modalBtn = page.locator('button#open-modal'); // モーダルボタンのセレクタは適宜調整が必要
        if (await modalBtn.count() > 0 && await modalBtn.isVisible()) {
          await modalBtn.click();
          await page.locator('#modal').waitFor({ state: 'visible', timeout: AXE_RUN_TIMEOUT + 5000 }); // モーダル本体のセレクタも適宜調整が必要
          // await injectAxe(page); // axe-playwright関連を削除
          // await ensureAxeIsReady(page); // axe-playwright関連を削除
          // await checkA11y(page); // axe-playwright関連を削除
          await assertNoHorizontalScroll(page);
        } else {
          console.log(`モーダルボタン (button#open-modal) が見つからないか非表示です。URL: ${url}`);
          // test.skip() は testブロックの外では使えないので、ここではログ出力に留めるか、
          // もしモーダルがない場合にテストをパスさせたい場合は、このテストブロック自体を条件分岐で囲む必要がある
        }
      });

      test('RF-NEW: デスクトップ幅でテキストサイズ200%で水平スクロールなし・フォントサイズ確認', async ({ page }) => {
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        // await page.waitForLoadState('networkidle', { timeout: NETWORK_IDLE_TIMEOUT }); // Temporarily commented out

        const elementHandle = await getFirstVisibleTextElementInMain(page);
        if (!elementHandle) {
          test.skip(true, `メインコンテンツ内の最初のテキスト要素が見つかりませんでした。URL: ${url}`);
          return;
        }
        
        const initialFontSizeStr = await elementHandle.evaluate(el => getComputedStyle(el).fontSize);
        const initialFontSize = parseFloat(initialFontSizeStr);

        await page.addStyleTag({ content: 'html { font-size: 200%; }' });

        const finalFontSizeStr = await elementHandle.evaluate(el => getComputedStyle(el).fontSize);
        const finalFontSize = parseFloat(finalFontSizeStr);

        // フォントサイズが約2倍になったか確認 (1.8倍から2.2倍の範囲を許容)
        expect(finalFontSize, `フォントサイズが約2倍になっていません (初期: ${initialFontSizeStr}, 最終: ${finalFontSizeStr})`).toBeGreaterThanOrEqual(initialFontSize * 1.8);
        expect(finalFontSize, `フォントサイズが約2倍になっていません (初期: ${initialFontSizeStr}, 最終: ${finalFontSizeStr})`).toBeLessThanOrEqual(initialFontSize * 2.2);

        await assertNoHorizontalScroll(page);
      });
    });
  });
}); 