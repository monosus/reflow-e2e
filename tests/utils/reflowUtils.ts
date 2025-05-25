import { Page, expect } from '@playwright/test';

/**
 * `<main>` 内で最初に見つかった可視テキスト要素を返す。
 * 見つからない場合は `null` を返す。
 */
export async function getFirstVisibleTextElementInMain(page: Page) {
  const handle = await page.evaluateHandle(() => {
    const main = document.querySelector('main');
    if (!main) {
      console.warn('`<main>` element not found when searching for the first visible text element.');
      return null;
    }
    const walker = document.createTreeWalker(
      main,
      NodeFilter.SHOW_ELEMENT,
      {
        acceptNode(node) {
          const el = node as HTMLElement;
          if (el.offsetParent !== null && el.textContent?.trim() !== '') {
            return NodeFilter.FILTER_ACCEPT;
          }
          return NodeFilter.FILTER_REJECT;
        },
      },
    );
    return walker.nextNode() as HTMLElement | null;
  });

  return handle?.asElement() ?? null;
}

/**
 * ページで水平方向のスクロールが発生していないことをアサートする。
 */
export async function assertNoHorizontalScroll(page: Page) {
  const noHScroll = await page.evaluate(() => document.body.scrollWidth <= window.innerWidth);
  expect(noHScroll, '水平スクロール発生').toBeTruthy();
}

/**
 * 指定されたフォントサイズ(% 単位)の配列を順番に適用しながらスクリーンショットを取得する。
 * `sizes` には 100, 150, 200... などの数値を渡す。
 */
export async function scaleFontSizeWithScreenshots(page: Page, sizes: number[], url: string) {
  for (const size of sizes) {
    await page.addStyleTag({ content: `html { font-size: ${size}% !important; }` });
    await page.waitForTimeout(200); // 視覚的な確認用に少し待つ
    await page.screenshot({ path: `screenshots/${encodeURIComponent(url)}-font-size-${size}.png` });
  }
}

/**
 * ビューポートを指定された幅の配列で順にリサイズしながらスクリーンショットを取得する。
 * `widths` には 1280, 1200, ... などの数値を渡す。
 */
export async function resizeViewportWithScreenshots(
  page: Page,
  widths: number[],
  url: string,
  height = 800,
) {
  for (const width of widths) {
    await page.setViewportSize({ width, height });
    await page.waitForTimeout(200);
    await page.screenshot({ path: `screenshots/${encodeURIComponent(url)}-width-${width}.png` });
  }
} 