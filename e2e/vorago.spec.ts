import { test, expect } from '@playwright/test';

test.describe('Vorago game', () => {
	test('starts a game and shows the board', async ({ page }) => {
		await page.goto('/vorago');

		// Start Game button should be visible
		const startBtn = page.getByRole('button', { name: 'Start Game' });
		await expect(startBtn).toBeVisible({ timeout: 5000 });
		await startBtn.click();

		// Board appears — the display message confirms the game is active
		await expect(
			page.getByText('Move a stone or use a coin')
		).toBeVisible({ timeout: 5000 });

		// The SVG board should be present
		await expect(page.locator('svg').first()).toBeVisible();
	});
});
