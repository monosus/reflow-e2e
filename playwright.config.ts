import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    viewport: { width: 1280, height: 800 },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  reporter: [['html', { open: 'never' }]],
}); 