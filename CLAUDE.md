# Atom Magic Project Memory

## Project Overview
Atom Magic is a Next.js website featuring the Vorago board game, Character Manager, and Codex (lore/rules). The site uses Payload CMS for content management.

## Tech Stack
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: Redux Toolkit (react-redux)
- **UI Components**: HeroUI v3 (Checkbox, CheckboxGroup, Select, Table, Accordion, Chip, etc.)
- **Animation**: Motion (Framer Motion), react-transition-group
- **CMS**: Payload CMS v3 (Local API, self-hosted)
- **Database**: PostgreSQL via Neon (Drizzle ORM, managed by Payload)
- **Media**: Vercel Blob storage (via `@payloadcms/storage-vercel-blob`)
- **Search**: Algolia (react-instantsearch)

## Project Structure
```
src/
├── app/
│   ├── (website)/          # Public pages
│   │   ├── vorago/         # Vorago game page
│   │   ├── codex/          # Codex/lore pages
│   │   ├── character/      # Character Manager
│   │   ├── map/            # Interactive world map
│   │   └── ...
│   ├── (payload)/          # Payload CMS admin panel
│   │   └── admin/          # Payload admin UI route
│   ├── api/                # API routes
│   │   ├── vorago-ai/      # AI opponent endpoint
│   │   └── algolia/        # Algolia bulk reindex endpoint
│   └── components/
│       ├── vorago/         # Vorago game components
│       ├── character/      # Character Manager components
│       └── common/         # Shared components
├── lib/
│   ├── slices/             # Redux slices
│   │   ├── voragoSlice.ts  # Vorago slice + action exports
│   │   ├── voragoTypes.ts  # Vorago TypeScript interfaces
│   │   ├── voragoConstants.ts # Coins, cell map, initial state
│   │   ├── voragoAIThunk.ts # AI turn execution logic
│   │   └── characterSlice.ts # Character state
│   ├── store.ts            # Redux store config
│   ├── payload.ts          # Payload Local API singleton (getPayloadClient)
│   ├── fetchCharacterData.ts # Fetches all character data from Payload
│   ├── character-types.ts  # NormedXxx types for character components
│   ├── creature-types.ts   # NormedCreature, CreatureFilters, normalizeCreature()
│   ├── gear-data.ts        # Weapons, armor, enhancements data (local)
│   └── global-data.js      # Paths, cardinals, scores constants
├── payload/
│   ├── collections/        # Payload collection configs (Entries, Creatures, etc.)
│   └── hooks/
│       └── algoliaSync.ts  # afterChange/afterDelete hooks for Algolia
├── payload-types.ts        # Auto-generated Payload types (do not edit)
├── payload.config.ts       # Payload configuration
└── markdown/               # Game rules reference (gitignored)
```

## Common Commands
```bash
npm run dev                      # Start development server
npm run build                    # Production build (use --webpack flag)
```

## Payload CMS

### Local API
All data fetching uses the Payload Local API singleton — never HTTP:
```typescript
import { getPayloadClient } from '@/lib/payload';
const payload = await getPayloadClient();
const result = await payload.find({ collection: 'entries', limit: 100, depth: 2 });
```

### Collections
| Collection | Slug | Admin title field | Notes |
|---|---|---|---|
| Entries | `entries` | `title` | Codex articles |
| Creatures | `creatures` | `name` | Uses `name` not `title` |
| Disciplines | `disciplines` | `title` | Magic schools |
| Techniques | `techniques` | `title` | Magic techniques |
| Paths | `paths` | `title` | Character paths (Theurgist, etc.) |
| Cultures | `cultures` | `title` | Playable cultures |
| Patronages | `patronages` | `title` | Patron deities/entities |
| Scores | `scores` | `title` | Physical, Interpersonal, Intellect, Psyche |
| Subscores | `subscores` | `title` | Sub-attributes under each score |
| Additional Scores | `additional-scores` | `title` | Derived stats |
| Enhancements | `enhancements` | `title` | Gear enhancements |
| Categories | `categories` | `title` | Hierarchical codex categories |
| Media | `media` | — | Image/file uploads (Vercel Blob) |
| Users | `users` | — | Admin users |
| Timeline | `timeline` | `title` | World timeline events |

### Types
Payload auto-generates types to `payload-types.ts`. Key differences from old Sanity types:
- `id: number` (not `_id: string`) — character components need the `_id` shim
- `slug: string` (not `{ current: string }`)
- Rich text fields use Lexical JSON (render with `<RichText content={...} />`)
- Creatures use `name` not `title`
- `environments` is `Array<{ environment: string; id: string }>` not `string[]`

### Normalized types (`src/lib/character-types.ts`, `src/lib/creature-types.ts`)
Character components expect `_id: string`. Use the `NormedXxx` types from `character-types.ts` and fetch via `fetchCharacterData()`, which calls `norm()` to add `_id = String(id)` to every document.

For creatures, use `normalizeCreature(doc)` from `creature-types.ts` which also flattens `environments[].environment → string[]` and resolves `mainImage.url`.

### Algolia sync
Incremental sync: Payload `afterChange`/`afterDelete` hooks in `src/payload/hooks/algoliaSync.ts` fire automatically on save/delete for Entries, Creatures, Disciplines, Techniques, Paths.

Bulk reindex: `POST /api/algolia?reindex=true&secret=<ALGOLIA_ADMIN_SECRET>`

### Rich text
All long-form content (entryBody, toc, descriptions on disciplines/techniques/paths/cultures/patronages) is stored as Lexical JSON. Render with:
```tsx
import { RichText } from '@/app/components/common/RichText';
<RichText content={doc.entryBody} />
```
The `RichText` component is at `src/app/components/common/RichText.tsx` and uses `@payloadcms/richtext-lexical/react`.

---

## Character Manager

### Overview
Multi-step character creation wizard with sections for basics, culture, path, patronage, scores, disciplines/techniques, gear, wealth, and animal companions.

### Key Files
| File | Purpose |
|------|---------|
| `src/app/components/character/Sections.tsx` | Main orchestrator, section visibility |
| `src/lib/slices/characterSlice.ts` | Redux state for character data |
| `src/lib/gear-data.ts` | Local weapon/armor/enhancement data |

### Character State (Redux)
```typescript
interface CharacterState {
  name, age, pronouns, description: string;
  culture, path, patronage: string;  // Payload document IDs (as strings)
  scores: Score[];                    // Physical, Interpersonal, Intellect, Psyche
  additionalScores: AdditionalScore[];
  disciplines, techniques: string[];  // Payload document IDs (as strings)
  gear: CharacterGearItem[];          // Local gear format
  wealth: { silver, gold, lead, uranium };
  animalCompanion: { id, name, details };
}
```

### Data Fetching
All character data is fetched server-side via `fetchCharacterData()` from `src/lib/fetchCharacterData.ts`. The character, generator, and shared pages call this and pass normalized data down to `<Sections />`.

### Gear System
Gear is local (not from CMS) using `src/lib/gear-data.ts`:
- **Weapons**: Standard (72) + Exotic (36) across light/medium/heavy, melee/ranged, tier 1/2/3
- **Armor**: Standard (36) + Exotic (36) with capacity, penalties, shield bonuses
- **Enhancements**: Generic (6) + Discipline-specific (14) with shield bonuses

### Shield Calculation
Displayed in AdditionalScores component:
- **Physical Shield** = Physical score + armor.physicalShieldBonus + enhancement.physicalShieldBonus
- **Psychic Shield** = Psyche score + armor.psychicShieldBonus + enhancement.psychicShieldBonus

### Gear Rolling Options
Users can filter by:
- Include exotic weapons/armor (toggles)
- Include enhancements (toggles)
- Weapon categories: light, medium, heavy
- Weapon types: melee, ranged
- Armor categories: light, medium, heavy
- Tiers: 1, 2, 3

---

## Vorago Game

### What is Vorago?
A strategic circular board game where players race to move 3 stones to the center goal.

### Core Mechanics
- **5 rotating rings** with varying cell counts (32, 16, 16, 8, 4)
- **Stone movement** toward center through adjacent cells
- **13 Cardinal Coins** with unique abilities and 1-round cooldowns
- **Walls/Bridges** that block or enable movement
- **Ring manipulation** (spin, lock, reset)
- **AI opponent** with difficulty levels (easy, medium, hard, expert)

### Key Vorago Files
| File | Purpose |
|------|---------|
| `src/lib/slices/voragoSlice.ts` | Redux state, game logic, AI thunk |
| `src/app/(website)/vorago/page.tsx` | Main game page |
| `src/app/components/vorago/VoragoBoard.tsx` | SVG board rendering |
| `src/app/components/vorago/CoinSelector.tsx` | Coin selection UI |
| `src/app/api/vorago-ai/route.ts` | AI decision-making API |

### Debug Mode
Set `DEBUG_MODE = true` in `VoragoBoard.tsx` to show ring rotations and cell indices.

---

---

## Design System

### Color Palette (Light Mode)
| Name | Hex | CSS Variable |
|------|-----|--------------|
| Gold | `#BB9731` | `--color-gold` |
| Gold Dark | `#836A22` | `--color-gold-dark` |
| Bright Gold | `#D4AF37` | `--color-brightgold` |
| Oxblood | `#722F37` | `--color-oxblood` |
| Laurel | `#5A6F4E` | `--color-laurel` |
| Bronze | `#8C7853` | `--color-bronze` |
| Stone | `#9A9A8E` | `--color-stone` |
| Stone Dark | `#6B6B62` | `--color-stone-dark` |
| Parchment | `#F5F0E1` | `--color-parchment` |

### UI Patterns
- No rounded corners (classical aesthetic)
- Border-based card styling with `border-2 border-stone`
- Marcellus font for headings
- Noto Serif for body text
- HeroUI components with `radius="none"`

### Spacing Standards
- Section padding: `py-12 md:py-16`
- Container padding: `px-6 md:px-8`
- Grid gaps: `gap-6` (cards), `gap-8` (major sections)
- Page backgrounds: `bg-parchment` for main content

### PageHero Component
Unified hero component at `src/app/components/common/PageHero.tsx`:

```typescript
interface PageHeroProps {
  title: string;
  description?: string;
  icon: string;                                      // MDI icon path
  accentColor: 'gold' | 'oxblood' | 'laurel' | 'bronze' | 'stone';
  variant?: 'full' | 'compact' | 'inline';           // Default: 'full'
  theme?: 'dark' | 'light';                          // Default: 'dark'
  cta?: { label: string; href: string };
}
```

**Variants:**
- `full`: Standard page hero (py-12 md:py-16, w-16 h-16 icon, decorative diamond divider)
- `compact`: Minimized version (py-4, w-10 h-10 icon) - for pages with scroll state
- `inline`: Tools-style hero (py-8 md:py-12, w-12 h-12 icon) - for tool pages

**Usage by page:**
| Page | Accent Color | Variant | Theme |
|------|--------------|---------|-------|
| Character Manager | oxblood | full/compact | dark |
| Vorago | laurel | full/compact | dark |
| Codex | gold | full | light |
| Timeline | laurel | full | light |
| Creatures | bronze | full | dark |
| Creature Manager | bronze | full | dark |
| Encounters | bronze | full | dark |
| Adventure Log | bronze | full | dark |
| Dice Roller | gold | inline | dark |
| Loot Roller | gold | inline | dark |
| Tools | gold | inline | dark |
| Quick Reference | gold | inline | dark |
| Map | laurel | full | light |

### Button Components
**LinkButton** (`src/app/components/common/LinkButton.tsx`):
- Primary: `bg-gold text-black hover:bg-brightgold`
- Secondary: `border-2 border-gold text-gold bg-transparent hover:bg-gold/10`
- Styling: `px-8 py-3 marcellus uppercase tracking-widest text-sm font-bold`

**FunctionButton** (`src/app/components/common/FunctionButton.tsx`):
- Same variants as LinkButton plus `danger` (oxblood)
- Uses HeroUI Button with `radius="none"`

---

## Recent Changes
- **CMS migration**: Fully migrated from Sanity CMS to Payload CMS v3 (Local API, PostgreSQL via Neon, Vercel Blob for media)
- Interactive world map at /map using Leaflet + CRS.Simple with tile layer and GeoJSON region overlay
- Custom creatures can be added to encounters via tabbed Codex/Custom creature selector
- Creature Manager feature: custom creature creation, editing, roster management, CMS cloning, .creatura file import/export
- Unified PageHero component replaces 7 separate hero components
- Standardized button styling (LinkButton, FunctionButton) with consistent padding and variants
- All tool pages use `bg-parchment` background
- Adventure Log feature added for session tracking
- Gear system rebuilt with local TypeScript data
- Dynamic shield calculations in AdditionalScores
- Removed Feranos as playable culture (kept mysterious)
- Turbopack root configured for nested project directory

---

## Key File Locations

Quick reference for finding important logic:

### Vorago Game
| What | File |
|------|------|
| Types (Stone, Cell, Coin, VoragoState) | `src/lib/slices/voragoTypes.ts` |
| Constants (COINS, initialState) | `src/lib/slices/voragoConstants.ts` |
| Slice + reducers | `src/lib/slices/voragoSlice.ts` |
| AI turn execution thunk | `src/lib/slices/voragoAIThunk.ts` |
| AI decision logic (API) | `src/app/api/vorago-ai/route.ts` |
| Board SVG rendering | `src/app/components/vorago/VoragoBoard.tsx` |

### Character Manager
| What | File |
|------|------|
| Section visibility state | `src/app/components/character/Sections.tsx` |
| Character Redux state | `src/lib/slices/characterSlice.ts` |
| Gear data (weapons/armor) | `src/lib/gear-data.ts` |
| Character persistence | `src/lib/characterPersistence.ts` |

### Creature Manager
| What | File |
|------|------|
| Custom creature Redux state | `src/lib/slices/customCreatureSlice.ts` |
| Creature persistence (localStorage + file I/O) | `src/lib/customCreaturePersistence.ts` |
| Main orchestrator (roster + editor layout) | `src/app/components/creatures/CreatureManager.tsx` |
| Editor form (auto-save, all fields) | `src/app/components/creatures/CustomCreatureEditor.tsx` |
| Roster sidebar | `src/app/components/creatures/CustomCreatureRoster.tsx` |
| Roster summary card | `src/app/components/creatures/CustomCreatureSummaryCard.tsx` |
| CMS creature picker modal | `src/app/components/creatures/CreaturePicker.tsx` |
| Page route | `src/app/(website)/(creature-tools)/creatures/manager/page.tsx` |

### Interactive Map
| What | File |
|------|------|
| Page route | `src/app/(website)/map/page.tsx` |
| Leaflet map (client, CRS.Simple) | `src/app/components/map/SolumMap.tsx` |
| GeoJSON region overlay + tooltips | `src/app/components/map/RegionOverlay.tsx` |
| Leaflet CSS overrides | `src/app/components/map/SolumMap.css` |
| Region data + map config | `src/lib/map-data.ts` |
| Tile generation script | `scripts/generate-tiles.mjs` |

### Common Components
| What | File |
|------|------|
| Page heroes | `src/app/components/common/PageHero.tsx` |
| Primary buttons | `src/app/components/common/LinkButton.tsx` |
| Action buttons | `src/app/components/common/FunctionButton.tsx` |
| Icon + label pairs | `src/app/components/common/IconLabel.tsx` |
| Category chips | `src/app/components/common/CategoryChip.tsx` |
| Error boundary | `src/app/components/common/ErrorBoundary.tsx` |

### IconLabel Component
Use for icon + text combinations (replaces repeated `flex items-center gap-*` patterns):

```tsx
import IconLabel from '@/app/components/common/IconLabel';
import { mdiHeart, mdiStar } from '@mdi/js';

// Simple icon + value
<IconLabel icon={mdiHeart} iconColor="text-oxblood">10</IconLabel>

// Icon + label prefix + value
<IconLabel icon={mdiStar} label="Enhancement">{name}</IconLabel>

// Large icon + title
<IconLabel icon={mdiSword} size="lg" iconColor="text-stone" gap="gap-2">
  <span className="marcellus font-semibold">Weapon Name</span>
</IconLabel>
```

Props: `icon`, `children`, `label?`, `iconColor?`, `size?` (xs/sm/md/lg), `gap?`, `className?`, `as?`

### Utilities
| What | File |
|------|------|
| Random selection | `src/lib/utils/random.ts` |
| Shield calculation | `src/lib/utils/shield.ts` |
| Score averaging | `src/lib/utils/score.ts` |

### Custom Hooks
| What | File |
|------|------|
| Character persistence | `src/lib/hooks/useCharacterPersistence.ts` |
| Character validation | `src/lib/hooks/useCharacterValidation.ts` |
| Section visibility | `src/lib/hooks/useSectionVisibility.ts` |

---

## Known Technical Debt

See `ROADMAP.md` for full tracking. Key items:

### Remaining Items
- **voragoSlice.ts** (800+ lines) - AI logic could be extracted to separate file (low priority)
- **GearTable.tsx** - Still using old column layout from Sanity era; could be redesigned now that gear is local data
- **Legacy gear codex page** (`/codex/gear/[slug]`) - Returns 404, can be deleted when convenient

---

## Patterns & Conventions

### State Management

**When to use Redux (Redux Toolkit):**
- Complex state shared across many components (character data, game state)
- State that needs to persist or be serialized
- State with complex update logic (reducers, thunks)
- When you need time-travel debugging

Current Redux slices:
| Slice | Purpose | Key Features |
|-------|---------|--------------|
| `characterSlice` | Character creation/editing | Scores, gear, disciplines, persistence |
| `voragoSlice` | Vorago game state | Board state, AI turns, coins, game logic |
| `customCreatureSlice` | Custom creature editing | Scores, combat stats, attacks, abilities, cloning |

**When to use React Context:**
- Theme/appearance state (dark mode)
- Data that flows down to many children but rarely changes
- Avoiding prop drilling for read-heavy data

Current Contexts:
| Context | Purpose |
|---------|---------|
| `ThemeContext` | Dark/light mode toggle |
| `RollContext` | Dice roll notifications |
| `CreatureDataContext` | Creature data for rollers and Creature Manager |

**When to use local state (useState):**
- UI-only state (modals, accordions, form inputs)
- State that doesn't need to be shared
- Temporary/ephemeral state

**Custom hooks for related state:**
- Group related useState calls into custom hooks (e.g., `useSectionVisibility`)
- Extract reusable state logic (e.g., `useCharacterPersistence`, `useCharacterValidation`)

### Random Selection
Use utilities from `src/lib/utils/random.ts`:
```typescript
import { selectRandomElement, randomDirection } from '@/lib/utils/random';

// Select random element from array (returns undefined if empty)
const item = selectRandomElement(items);

// Get random direction for ring rotation
const dir = randomDirection(); // 'cw' | 'ccw'
```

### Component Naming Conventions

**Directory structure:**
```
src/app/components/
├── common/           # Shared UI components (PageHero, LinkButton, etc.)
├── character/        # Character Manager components
│   └── sections/     # Wizard sections (ChooseCulture, ManageGear, etc.)
│       └── scores/   # Score-related components
├── vorago/           # Vorago game components
├── codex/            # Codex/lore components
├── map/              # Interactive world map (Leaflet)
├── creatures/        # Creature roller components
├── encounters/       # Encounter builder components
├── adventure-log/    # Session logging components
├── dice/             # Dice roller components
├── tools/            # Tools page components
├── contact/          # Contact form components
├── home/             # Homepage components
└── global/           # Layout components (Header, Footer)
```

**Naming patterns:**
| Pattern | Usage | Example |
|---------|-------|---------|
| `Choose*` | Selection/picker components | `ChooseCulture.tsx`, `ChoosePath.tsx` |
| `Manage*` | CRUD/editing components | `ManageGear.tsx`, `ManageWealth.tsx` |
| `*Sheet` | Print/display views | `CharacterSheet.tsx` |
| `*Card` | Compact display components | `CharacterSummaryCard.tsx` |
| `*Roster` | List management | `CharacterRoster.tsx` |
| `*Context` | React Context providers | `ThemeContext.tsx`, `RollContext.tsx` |
| `use*` | Custom hooks | `useCharacterPersistence.ts` |
| `*Slice` | Redux slices | `characterSlice.ts`, `voragoSlice.ts` |

**File naming:**
- Components: PascalCase (`PageHero.tsx`)
- Hooks: camelCase with `use` prefix (`useSectionVisibility.ts`)
- Utilities: camelCase (`random.ts`, `shield.ts`)
- Data files: kebab-case (`gear-data.ts`, `global-data.js`)

### Console Logging
- Keep console.error for actual error handling
- Remove console.log for production (development debugging only)
- API routes can log errors server-side

### Component Patterns
- HeroUI components always use `radius="none"` for classical aesthetic
- Page heroes use `PageHero` component with accent colors matching page theme
- Cards use `border-2 border-stone` instead of shadows or rounded corners

---

## Figma MCP Integration Rules

These rules govern all Figma-to-code and code-to-Figma workflows.

### Required Figma-to-Code Flow

1. Run `get_design_context` first to fetch the structured representation of the node
2. If the response is too large, run `get_metadata` to get the node map, then re-fetch specific nodes
3. Run `get_screenshot` for visual reference of the node being implemented
4. Only after both context and screenshot are retrieved, begin implementation
5. Translate MCP output (React + Tailwind) into this project's conventions (see below)
6. Validate against the Figma screenshot for 1:1 visual parity before marking complete

### Design Tokens

**IMPORTANT: Never hardcode colors, spacing, or typography values.** All tokens are defined in `src/app/globals.css` (`@theme` block) and `src/tailwind.config.ts`.

| Token | Tailwind class | CSS variable |
|-------|---------------|--------------|
| Gold | `text-gold` / `bg-gold` | `--color-gold` |
| Gold Dark | `text-gold-dark` | `--color-gold-dark` |
| Bright Gold | `bg-brightgold` | `--color-brightgold` |
| Oxblood | `text-oxblood` / `bg-oxblood` | `--color-oxblood` |
| Laurel | `text-laurel` / `bg-laurel` | `--color-laurel` |
| Bronze | `text-bronze` / `bg-bronze` | `--color-bronze` |
| Stone | `text-stone` / `bg-stone` | `--color-stone` |
| Stone Dark | `text-stone-dark` | `--color-stone-dark` |
| Parchment | `bg-parchment` | `--color-parchment` |
| Black | `text-black` / `bg-black` | `rgb(35, 31, 32)` |

Dark mode uses CSS variables `--theme-bg`, `--theme-text`, `--theme-border` that flip automatically via `.dark` class.

### Typography

- **Headings / UI labels**: `marcellus` utility class → `var(--font-marcellus)` (Marcellus SC, uppercase small-caps feel)
- **Body text**: `notoserif` utility class → `var(--font-notoserif)` (Noto Serif)
- **Decorative / inscriptions**: `lapideum` utility class → `var(--font-lapideum)` (spaced, monospaced feel)
- **IMPORTANT**: Never use `font-sans` or generic system fonts — all text should use one of the three project fonts

### Component Location & Naming

- Shared UI components: `src/app/components/common/`
- Page-specific components: `src/app/components/[feature]/` (e.g., `character/`, `vorago/`, `creatures/`)
- New components from Figma designs go in `common/` if reusable, or the relevant feature folder
- Naming: PascalCase for components, camelCase for hooks (`use*`), kebab-case for data files

### Styling Rules

- **IMPORTANT**: Use Tailwind CSS 4 utility classes — no inline styles, no CSS modules, no styled-components
- **IMPORTANT**: No rounded corners (`rounded-*`) — the classical aesthetic uses sharp edges only
- **IMPORTANT**: HeroUI components always pass `radius="none"`
- Borders use `border-2 border-stone` (cards) or `border-2 border-gold` (highlighted)
- Section padding: `py-12 md:py-16` — container padding: `px-6 md:px-8`
- Page backgrounds: `bg-parchment` for content areas, `bg-black` for high-contrast sections
- Shadows: avoid — use borders instead

### Icon System

Icons use `@mdi/react` with Material Design Icons paths from `@mdi/js`:

```tsx
import Icon from '@mdi/react';
import { mdiSword } from '@mdi/js';

<Icon path={mdiSword} size={1} className="text-gold" />
```

- **IMPORTANT**: Do not install new icon packages — use MDI only
- **IMPORTANT**: If Figma MCP returns a localhost source for an SVG asset, use that source directly
- Map icon assets for the world map are stored in `public/map-icons/` as transparent PNGs

### Existing Reusable Components (use before creating new ones)

| Component | Path | Purpose |
|-----------|------|---------|
| `PageHero` | `common/PageHero.tsx` | Page hero with icon, title, description, CTA |
| `LinkButton` | `common/LinkButton.tsx` | `<a>` navigation button (primary/secondary) |
| `FunctionButton` | `common/FunctionButton.tsx` | Action button (primary/secondary/danger/ghost/chip) |
| `IconLabel` | `common/IconLabel.tsx` | MDI icon + label/value pair |
| `CategoryChip` | `common/CategoryChip.tsx` | Colored category tag |
| `ErrorBoundary` | `common/ErrorBoundary.tsx` | React error boundary wrapper |

### Asset Handling

- Static assets (images, textures): `public/`
- Map terrain icons (PNGs): `public/map-icons/`
- CMS media images: served via Vercel Blob — access via `(doc.mainImage as Media).url` after depth-resolving the relationship
- **IMPORTANT**: If Figma MCP server returns a localhost source for an image or SVG, use that source directly — do not create placeholders
