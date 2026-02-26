import { test, expect } from '@playwright/test';

test.describe('Character creation', () => {
	test('loads the page, fills basics, and advances to culture selection', async ({ page }) => {
		await page.goto('/character');

		// Page title should be present
		await expect(page).toHaveTitle(/Atom Magic/i);

		// Name input is in "The Basics" section
		const nameInput = page.getByPlaceholder('Enter Character Name');
		await expect(nameInput).toBeVisible({ timeout: 5000 });
		await nameInput.fill('Varro');

		// Click CONTINUE to advance past basics
		await page.getByRole('button', { name: /continue/i }).click();

		// Culture section loads from Sanity — wait for it
		await expect(page.getByText('Choose a Culture')).toBeVisible({ timeout: 15000 });
	});
});
