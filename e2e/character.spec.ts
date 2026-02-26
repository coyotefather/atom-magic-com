import { test, expect } from '@playwright/test';

test.describe('Character creation', () => {
	test('loads the page and navigates to culture selection', async ({ page }) => {
		await page.goto('/character');

		// Page title should be present
		await expect(page).toHaveTitle(/Atom Magic/i);

		// If the roster appears, click New Character to start fresh
		const newCharBtn = page.getByRole('button', { name: 'New Character' });
		if (await newCharBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
			await newCharBtn.click();
		}

		// Name input is in "The Basics" section
		const nameInput = page.getByPlaceholder('Enter Character Name');
		await expect(nameInput).toBeVisible({ timeout: 5000 });
		await nameInput.fill('Varro');

		// Culture section loads from Sanity — wait for it
		await expect(page.getByText('Choose a Culture')).toBeVisible({ timeout: 15000 });
	});
});
