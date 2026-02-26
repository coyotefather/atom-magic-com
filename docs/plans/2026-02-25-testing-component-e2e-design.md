# Testing: Component Tests + Playwright E2E — Design Doc

**Date:** 2026-02-25

## Goal

Complete the two remaining Testing Infrastructure roadmap items: component tests for CoinSelector and CharacterRoster, and Playwright E2E smoke tests for the create-character and Vorago game flows.

## Component Tests

Uses the existing Vitest + React Testing Library + jsdom stack (already installed). Both target components are Redux-connected, so a shared `renderWithProviders` helper is needed.

### `src/test/utils.tsx`
Add `renderWithProviders(ui, preloadedState?)` — creates a real Redux store with optional preloaded state, wraps the component in `<Provider>`, and returns RTL's `render` result plus the store.

### `CoinSelector.test.tsx` (4 tests)
- Renders coin buttons for the current player
- A coin on cooldown renders as disabled
- An inapplicable coin (Aura when no walls/bridges exist) is grayed out
- Clicking an available coin dispatches `useCoin` and marks it selected

### `CharacterRoster.test.tsx` (4 tests)
- Shows loading state then renders characters from localStorage
- Clicking a character dispatches `loadCharacter` and calls `onCharacterSelected` prop
- Delete → confirm flow removes the character from the list
- "New character" button calls `onNewCharacter` prop

## Playwright E2E

Install `@playwright/test`. Config: baseURL `http://localhost:3000`, Chromium only, no parallelism. Tests in `e2e/` directory. Requires `npm run dev` running locally with Sanity env vars.

### `e2e/character.spec.ts`
Navigate to `/character`, wait for culture options to load from Sanity, type a name, select a culture, assert the wizard advances to the next section.

### `e2e/vorago.spec.ts`
Navigate to `/vorago`, start a game, click a valid player-1 stone, assert the stone position changed.

## Roadmap Update

Add to ROADMAP.md Testing Infrastructure section:
```
- [ ] **Testing revisit** — After map, campaign management, and creature stat block features are complete, revisit component and E2E coverage for new flows
```
