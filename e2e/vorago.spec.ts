import { test, expect } from '@playwright/test';

test.describe('Vorago game', () => {
	test('loads the game board and shows turn status', async ({ page }) => {
		await page.goto('/vorago');

		// Game board SVG should be present
		await expect(page.locator('svg').first()).toBeVisible({ timeout: 5000 });

		// Game status shows the current turn
		await expect(page.getByRole('status', { name: 'Game status' })).toBeVisible({ timeout: 5000 });
	});
});
