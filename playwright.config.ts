import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: './e2e',
	use: {
		baseURL: 'http://localhost:3000',
		headless: true,
	},
	projects: [
		{ name: 'chromium', use: { browserName: 'chromium' } },
	],
	workers: 1,
});
