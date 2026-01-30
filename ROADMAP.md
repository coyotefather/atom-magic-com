# Atom Magic Roadmap

Feature ideas and improvements for the Atom Magic website.

## Character Manager Enhancements

### Quick wins
- [x] **Print stylesheet** - A dedicated print layout that formats the character as a proper character sheet
- [x] **Multiple characters** - Let users save/manage multiple characters in browser storage, not just one
- [x] **Character summary card** - A compact view showing key stats at a glance (shields, armor, disciplines)

### Bigger features
- [x] **Character generator** - Randomly generate characters with easy/advanced modes:
  - **Easy mode** (NPC generator): Quick random generation for throwaway NPCs
  - **Advanced mode**: Full control with lock/randomize options for each choice
  - Lock specific choices (e.g., "I want a Theurgist" or "I want Spiranos culture") and randomize the rest
  - Presets for common archetypes (battle mage, healer, rogue, etc.)
  - Review and tweak results before saving
- [ ] **Shareable characters** - Generate a URL or QR code to share a character (could encode in URL params or use a simple backend)

## New Utility Tools

### For players
- [x] **Dice roller** - Quick dice roller with presets for common rolls (d20, 2d6, etc.) - useful during play
- [x] **Quick reference panel** - Collapsible sidebar with commonly-needed rules (combat flow, damage types, etc.)

### For GMs (Dominus Ludi)
- [x] **Encounter builder** - Select creatures from the creature roller, set quantities, calculate total threat
- [x] **Loot/treasure roller** - Random item generation tables

### Session Tools
- [x] **Adventure log** - Track rolls, character actions, and story events during play. Could include:
  - Roll history with context (what the roll was for, who rolled)
  - Character action entries ("Varro picked the lock", "Livia cast Thermal Surge")
  - GM notes for story beats, NPC encounters, discoveries
  - Timestamps for pacing analysis
  - Export to session summary / "Previously on..." recap

## Site-wide

- [x] **Dark mode toggle** - The color palette inverted for comfortable nighttime use
- [ ] **PWA support** - Offline access to Codex entries would be valuable for sessions without reliable internet
- [ ] **Bookmarks** - Let users save favorite Codex entries

## Vorago

- [ ] **Save/resume games** - Similar to character persistence
- [ ] **Game replay** - Step through a completed game move-by-move

## Content & Documentation

- [x] **Quick Reference audit** - Review Quick Reference page against markdown rules files to ensure accuracy and completeness
- [x] **Contact form** - Build functional contact form with spam prevention (honeypot, rate limiting), privacy compliance, and email delivery

## Polish & Optimization

- [x] **Component optimization** - Identify repeated UI patterns and extract into reusable components. Look for other performance optimizations.
- [x] **UX & styling finalization** - Review and refine the user experience and visual consistency across all pages.
- [x] **Algolia API optimization** - Review search implementation to minimize API calls and stay within plan limits.
- [x] **Sanity API optimization** - Review CMS queries and caching to minimize API usage and stay within plan limits.

## Code Quality & Technical Debt

### Quick wins
- [x] **DEBUG_MODE to env variable** - Move hardcoded `DEBUG_MODE` in `VoragoBoard.tsx` to environment variable
- [x] **Extract shield calculation utility** - Duplicate shield calc logic in `CharacterGenerator.tsx` and `CharacterSheet.tsx`
- [x] **Extract random selection utility** - Create `selectRandomElement<T>()` to replace 8 repeated patterns in `voragoSlice.ts`
- [x] **Remove dead commented code** - Clean up `ScoreUpdate` interface in `characterSlice.ts` and other commented blocks
- [x] **Extract score average utility** - Created `calculateScoreAverage()` in `src/lib/utils/score.ts`
- [x] **Remove/guard Algolia console.logs** - Removed all debug console.logs from `api/algolia/route.ts`
- [x] **Fix remaining `any` types** - Added `SanityDocument` interface, proper error handling, imported `Rule` type

### High priority
- [x] **Vorago AI logging cleanup** - Replace 40+ console.logs in `voragoSlice.ts:269-514` with proper logging or remove
- [x] **Type safety in vorago-ai route** - Replace multiple `any` types in `vorago-ai/route.ts` with proper TypeScript types
- [x] **Fix CategoryChip typing** - Replace `chipColor: any` in `CategoryChip.tsx` with proper color type

### Medium priority
- [x] **Extract Vorago AI helpers** - Split `voragoSlice.ts` into 4 files: types, constants, AI thunk, and slice

### Performance optimization
- [ ] **Memoize ChooseDisciplinesAndTechniques** - Remove JSX-in-state anti-pattern, add useCallback for handlers (311 lines)
- [ ] **Split CharacterGenerator.tsx** - Extract GeneratorMode and GeneratorPreview sub-components (547 lines)
- [ ] **Memoize CoinSelector calculations** - `getInapplicableCoins()` runs expensive filtering every render (484 lines)
- [ ] **Optimize VoragoBoard rendering** - Memoize geometry calculations, extract cell render to sub-component (560 lines)
- [x] **ContactForm error state** - Already has error UI (lines 249-254) showing errors to users
- [x] **Clean up Refactor suffix components** - Renamed to `Score.tsx` and `SubScore.tsx`
- [x] **Extract section visibility hook** - Created `useSectionVisibility` hook in `src/lib/hooks/`

### Documentation
- [x] **Document state management patterns** - When to use Redux vs Context API (added to CLAUDE.md)
- [x] **Document component naming conventions** - Clarify naming patterns and suffixes (added to CLAUDE.md)

---

## Completed

- [x] Character save/load to .solum files
- [x] Character resume from browser storage
- [x] Creature roller with filtering
- [x] Unified entry system (creatures, disciplines, techniques, paths in Codex)
- [x] Print stylesheet for character sheet
- [x] Dice roller with animation and history
- [x] Quick reference panel with accordion sections
- [x] Tools hub page and navigation updates
- [x] Loot/treasure roller with weapons, armor, items, and coins
- [x] Multiple characters support with roster management
- [x] Character summary cards with shield/armor/discipline stats in roster view
- [x] Dark mode toggle with theme persistence
- [x] Character generator with easy/advanced modes and archetype presets
- [x] Encounter builder with threat calculation and party-relative difficulty
- [x] Adventure log with roll capture, action/note entries, key events, and session export
- [x] Contact form with Resend, honeypot spam prevention, rate limiting, and privacy consent
