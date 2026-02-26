# Component Tests + Playwright E2E Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add React Testing Library component tests for CoinSelector and CharacterRoster, install Playwright for E2E smoke tests of the character-creation and Vorago game flows, and update the roadmap.

**Architecture:** Component tests extend the existing Vitest + jsdom setup with a shared `renderWithProviders` Redux wrapper. Playwright tests run against `npm run dev` locally (requires Sanity env vars for character flow). A `renderWithProviders` helper is added to `src/test/utils.tsx` and reused by both component test files.

**Tech Stack:** Vitest, `@testing-library/react`, `@testing-library/user-event`, Redux Toolkit, `@playwright/test`, Chromium

---

### Task 1: `renderWithProviders` test utility

**Files:**
- Create: `src/test/utils.tsx`

**Step 1: Create the utility**

```tsx
import { render, type RenderOptions } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import type { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import voragoReducer from '@/lib/slices/voragoSlice';
import characterReducer from '@/lib/slices/characterSlice';
import customCreatureReducer from '@/lib/slices/customCreatureSlice';
import type { RootState } from '@/lib/store';

export function renderWithProviders(
	ui: React.ReactElement,
	{
		preloadedState,
		...renderOptions
	}: { preloadedState?: Partial<RootState> } & Omit<RenderOptions, 'wrapper'> = {}
) {
	const store = configureStore({
		reducer: {
			character: characterReducer,
			vorago: voragoReducer,
			customCreature: customCreatureReducer,
		},
		preloadedState,
	});

	function Wrapper({ children }: PropsWithChildren) {
		return <Provider store={store}>{children}</Provider>;
	}

	return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
```

**Step 2: Verify it type-checks**

```bash
npx tsc --noEmit 2>&1 | grep "utils.tsx"
```
Expected: no errors for that file.

**Step 3: Commit**

```bash
git add src/test/utils.tsx
git commit -m "test: add renderWithProviders Redux wrapper utility"
```

---

### Task 2: CoinSelector component tests

**Files:**
- Create: `src/app/components/vorago/__tests__/CoinSelector.test.tsx`

**Context:**
- `CoinSelector` uses `role="listbox" aria-label="Available coin abilities"` for the coin grid
- Each coin renders as `role="option"` with `aria-label="{title}: {description}{statusText}"`
- `statusText` is `, on cooldown` / `, not applicable` / `, active` etc.
- Buttons have `disabled={true}` when on cooldown or inapplicable
- In initial Vorago state: Aura is inapplicable (no walls/bridges on board)
- In initial Vorago state: Anathema is applicable (rings start unlocked)
- Clicking a coin dispatches `useCoin(coin.title)` → sets `state.vorago.selectedCoin`

**Step 1: Write the tests**

```tsx
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import CoinSelector from '@/app/components/vorago/CoinSelector';
import { renderWithProviders } from '@/test/utils';
import { COINS } from '@/lib/slices/voragoSlice';

describe('CoinSelector', () => {
	it('renders all available coins in the listbox', () => {
		renderWithProviders(<CoinSelector />);
		const listbox = screen.getByRole('listbox', { name: 'Available coin abilities' });
		const options = listbox.querySelectorAll('[role="option"]');
		expect(options).toHaveLength(COINS.length);
	});

	it('renders a cooldown coin as disabled', () => {
		renderWithProviders(<CoinSelector />, {
			preloadedState: {
				vorago: {
					disabledCoins: { player1: ['Anathema'], player2: [] },
				} as never,
			},
		});
		const btn = screen.getByRole('option', { name: /Anathema.*on cooldown/i });
		expect(btn).toBeDisabled();
	});

	it('renders an inapplicable coin as disabled', () => {
		// Aura is inapplicable in initial state (no walls or bridges on board)
		renderWithProviders(<CoinSelector />);
		const btn = screen.getByRole('option', { name: /Aura.*not applicable/i });
		expect(btn).toBeDisabled();
	});

	it('clicking an available coin sets it as the selected coin in state', async () => {
		// Anathema (lockRing) is applicable when rings are unlocked (initial state)
		const { store } = renderWithProviders(<CoinSelector />);
		const btn = screen.getByRole('option', { name: /^Anathema/i });
		await userEvent.click(btn);
		expect(store.getState().vorago.selectedCoin).toBe('Anathema');
	});
});
```

**Step 2: Run and verify pass**

```bash
npx vitest run src/app/components/vorago/__tests__/CoinSelector.test.tsx
```
Expected: 4 tests pass. If CoinSVG causes SVG-related failures, add this mock at the top of the test file:
```tsx
vi.mock('@/app/components/vorago/CoinSVGs', () => ({
	default: ({ aspect }: { aspect: string }) => <span data-testid={`coin-svg-${aspect}`} />,
}));
```

**Step 3: Run full suite**

```bash
npx vitest run
```
Expected: all tests pass (previous 109 + 4 new = 113).

**Step 4: Commit**

```bash
git add src/app/components/vorago/__tests__/CoinSelector.test.tsx
git commit -m "test: add CoinSelector component tests"
```

---

### Task 3: CharacterRoster component tests

**Files:**
- Create: `src/app/components/character/__tests__/CharacterRoster.test.tsx`

**Context:**
- `CharacterRoster` reads/writes localStorage via `getRoster()`, `getCharacterById()`, `deleteCharacterById()`
- localStorage keys: `'atom-magic-roster'` (roster), `'atom-magic-character-{id}'` (individual characters)
- On mount it calls `migrateToMultiCharacter()` (safe — migrates old single-char storage if present)
- Shows "Loading characters..." briefly while `isLoading` is true
- "New Character" button text: "New Character"
- Delete flow: click delete icon → "Confirm" button appears → click "Confirm" → character removed
- `CharacterSummaryCard` renders the character name inside it
- `onCharacterSelected(id)` is called after selecting a character

**Step 1: Write the tests**

```tsx
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CharacterRoster from '@/app/components/character/CharacterRoster';
import { renderWithProviders } from '@/test/utils';
import type { CharacterSummary } from '@/lib/characterPersistence';

const ROSTER_KEY = 'atom-magic-roster';
const CHAR_KEY = 'atom-magic-character-test-1';

const mockSummary: CharacterSummary = {
	id: 'test-1',
	name: 'Varro',
	culture: 'Spiranos',
	path: 'Theurgist',
	patronage: 'None',
	physicalShield: 5,
	psychicShield: 5,
	armorCapacity: 0,
	disciplineCount: 2,
	techniqueCount: 3,
	isComplete: true,
	lastModified: new Date().toISOString(),
};

const minimalCharacter = {
	name: 'Varro', age: '', pronouns: '', description: '',
	culture: '', path: '', patronage: '',
	scores: [], additionalScores: [], disciplines: [], techniques: [],
	gear: [], wealth: { silver: 0, gold: 0, lead: 0, uranium: 0 },
	animalCompanion: { id: '', name: '', details: '' },
};

beforeEach(() => {
	localStorage.clear();
});

describe('CharacterRoster', () => {
	it('shows loading then renders characters from localStorage', async () => {
		localStorage.setItem(ROSTER_KEY, JSON.stringify({
			activeCharacterId: null,
			characters: [mockSummary],
		}));

		renderWithProviders(
			<CharacterRoster onCharacterSelected={vi.fn()} onNewCharacter={vi.fn()} />
		);

		// Loading state appears first
		expect(screen.getByText('Loading characters...')).toBeInTheDocument();

		// Then character appears
		await waitFor(() => expect(screen.getByText('Varro')).toBeInTheDocument());
	});

	it('calls onCharacterSelected with the character id when clicked', async () => {
		localStorage.setItem(ROSTER_KEY, JSON.stringify({
			activeCharacterId: null,
			characters: [mockSummary],
		}));
		localStorage.setItem(CHAR_KEY, JSON.stringify(minimalCharacter));

		const onSelected = vi.fn();
		renderWithProviders(
			<CharacterRoster onCharacterSelected={onSelected} onNewCharacter={vi.fn()} />
		);

		await waitFor(() => screen.getByText('Varro'));
		await userEvent.click(screen.getByText('Edit'));
		expect(onSelected).toHaveBeenCalledWith('test-1');
	});

	it('removes a character after delete confirmation', async () => {
		localStorage.setItem(ROSTER_KEY, JSON.stringify({
			activeCharacterId: null,
			characters: [mockSummary],
		}));

		renderWithProviders(
			<CharacterRoster onCharacterSelected={vi.fn()} onNewCharacter={vi.fn()} />
		);

		await waitFor(() => screen.getByText('Varro'));

		// Click the delete button (title="Delete character")
		await userEvent.click(screen.getByTitle('Delete character'));

		// Confirm button appears
		await userEvent.click(screen.getByRole('button', { name: /confirm/i }));

		// Character is removed from the list
		await waitFor(() => expect(screen.queryByText('Varro')).not.toBeInTheDocument());
	});

	it('calls onNewCharacter when New Character button is clicked', async () => {
		localStorage.setItem(ROSTER_KEY, JSON.stringify({
			activeCharacterId: null,
			characters: [],
		}));

		const onNew = vi.fn();
		renderWithProviders(
			<CharacterRoster onCharacterSelected={vi.fn()} onNewCharacter={onNew} />
		);

		await waitFor(() => screen.getByText('New Character'));
		await userEvent.click(screen.getByText('New Character'));
		expect(onNew).toHaveBeenCalled();
	});
});
```

**Step 2: Run and verify**

```bash
npx vitest run src/app/components/character/__tests__/CharacterRoster.test.tsx
```
Expected: 4 tests pass. If a button's accessible name doesn't match (e.g. delete button title differs), inspect via `screen.debug()` and adjust the selector.

**Step 3: Run full suite**

```bash
npx vitest run
```
Expected: all tests pass (113 + 4 = 117).

**Step 4: Commit**

```bash
git add src/app/components/character/__tests__/CharacterRoster.test.tsx
git commit -m "test: add CharacterRoster component tests"
```

---

### Task 4: Install and configure Playwright

**Files:**
- Modify: `package.json` (add `e2e` script)
- Create: `playwright.config.ts`
- Create: `.gitignore` addition for `playwright-report/` and `test-results/`

**Step 1: Install Playwright**

```bash
npm install --save-dev @playwright/test
npx playwright install chromium
```

**Step 2: Create `playwright.config.ts`**

```typescript
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
```

**Step 3: Add `e2e` script to `package.json`**

In the `"scripts"` section, add:
```json
"test:e2e": "playwright test"
```

**Step 4: Update `.gitignore`**

Add these lines at the end of `.gitignore`:
```
# Playwright
playwright-report/
test-results/
```

**Step 5: Verify build still passes**

```bash
npx vitest run
```
Expected: all 117 tests still pass (Playwright doesn't affect Vitest).

**Step 6: Commit**

```bash
git add playwright.config.ts package.json package-lock.json .gitignore
git commit -m "test: install Playwright + config for E2E tests"
```

---

### Task 5: Character creation E2E smoke test

**Files:**
- Create: `e2e/character.spec.ts`

**Context:**
- The `/character` page is server-rendered and loads cultures from Sanity CMS
- The page shows either the `CharacterRoster` (if localStorage has characters) or the wizard directly
- The roster has a "New Character" button; the wizard's first section is "The Basics" with a Name field
- After basics, "Choose a Culture" section appears (populated from Sanity)
- Requires `npm run dev` running with valid Sanity env vars in `.env.local`

**Step 1: Create the test**

```typescript
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
```

**Step 2: Run the E2E test (requires dev server)**

In one terminal:
```bash
npm run dev
```

In another:
```bash
npx playwright test e2e/character.spec.ts
```
Expected: 1 test passes.

**Step 3: Commit**

```bash
git add e2e/character.spec.ts
git commit -m "test(e2e): add character creation smoke test"
```

---

### Task 6: Vorago game E2E smoke test

**Files:**
- Create: `e2e/vorago.spec.ts`

**Context:**
- The `/vorago` page shows `GameSetup` component initially with a "Start Game" button
- After clicking Start Game, `VoragoBoard` SVG renders and a display message "Move a stone or use a coin" appears
- The board SVG has `role="img"` or is a plain `<svg>` — the test verifies the game state message

**Step 1: Create the test**

```typescript
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
```

**Step 2: Run the E2E test (requires dev server)**

```bash
npx playwright test e2e/vorago.spec.ts
```
Expected: 1 test passes.

**Step 3: Run both E2E tests together**

```bash
npx playwright test
```
Expected: 2 tests pass.

**Step 4: Commit**

```bash
git add e2e/vorago.spec.ts
git commit -m "test(e2e): add Vorago game start smoke test"
```

---

### Task 7: Update ROADMAP.md

**Files:**
- Modify: `ROADMAP.md`

**Step 1: Mark completed items and add revisit item**

In the `## Testing Infrastructure` section:

1. Change both "Nice to have" items from `- [ ]` to `- [x]`
2. Add a new item under Nice to have:

```markdown
- [ ] **Testing revisit** — After map, campaign management, and creature stat block features are complete, revisit component and E2E coverage for new flows
```

**Step 2: Commit**

```bash
git add ROADMAP.md
git commit -m "docs(roadmap): mark component + E2E tests complete, add testing revisit item"
```

---

### Task 8: Final verification

**Step 1: Run Vitest suite**

```bash
npx vitest run
```
Expected: 117 tests pass (109 original + 4 CoinSelector + 4 CharacterRoster).

**Step 2: Production build**

```bash
npm run build -- --webpack 2>&1 | tail -5
```
Expected: clean build, no errors.

**Step 3: Run E2E tests (requires `npm run dev` in a separate terminal)**

```bash
npx playwright test
```
Expected: 2 tests pass (character creation + Vorago start).
