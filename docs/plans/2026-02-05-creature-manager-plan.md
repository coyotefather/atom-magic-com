# Creature Manager Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Creature Manager tool that lets GMs create, customize, and manage custom creatures with localStorage persistence, file export/import, and clone-from-existing functionality.

**Architecture:** Redux slice for state management (consistent with Character Manager), localStorage roster/detail persistence pattern (matching Character Manager and Encounter Builder), and a side-by-side responsive layout within the existing `(creature-tools)` route group that provides CMS creature data via `CreatureDataContext`.

**Tech Stack:** Next.js 16 App Router, TypeScript, Redux Toolkit, Tailwind CSS 4, HeroUI, MDI icons

---

### Task 1: Create Redux Slice

**Files:**
- Create: `src/lib/slices/customCreatureSlice.ts`
- Modify: `src/lib/store.ts`

**Step 1: Create the Redux slice**

Create `src/lib/slices/customCreatureSlice.ts` with the following:

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

interface Attack {
  id: string;
  name: string;
  damage: string;
}

interface SpecialAbility {
  id: string;
  name: string;
  description: string;
}

export interface CustomCreatureState {
  loaded: boolean;
  id: string;
  name: string;
  description: string;
  // Scores
  physical: number;
  interpersonal: number;
  intellect: number;
  psyche: number;
  // Combat
  health: number;
  physicalShield: number;
  psychicShield: number;
  armorCapacity: number;
  attacks: Attack[];
  specialAbilities: SpecialAbility[];
  // Tags
  challengeLevel: string;
  creatureType: string;
  environments: string[];
  isSwarm: boolean;
  isUnique: boolean;
  // Reference
  basedOnId: string | null;
  basedOnName: string | null;
  // Meta
  lastModified: string;
}

const initialState: CustomCreatureState = {
  loaded: false,
  id: '',
  name: '',
  description: '',
  physical: 10,
  interpersonal: 10,
  intellect: 10,
  psyche: 10,
  health: 10,
  physicalShield: 0,
  psychicShield: 0,
  armorCapacity: 0,
  attacks: [],
  specialAbilities: [],
  challengeLevel: 'moderate',
  creatureType: '',
  environments: [],
  isSwarm: false,
  isUnique: false,
  basedOnId: null,
  basedOnName: null,
  lastModified: '',
};

export const customCreatureSlice = createSlice({
  name: 'customCreature',
  initialState,
  reducers: {
    loadCreature: (_state, action: PayloadAction<CustomCreatureState>) => {
      return { ...action.payload, loaded: true };
    },
    clearCreature: () => {
      return { ...initialState };
    },
    setCreatureName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
    setCreatureDescription: (state, action: PayloadAction<string>) => {
      state.description = action.payload;
    },
    setCreatureScore: (state, action: PayloadAction<{ field: 'physical' | 'interpersonal' | 'intellect' | 'psyche'; value: number }>) => {
      state[action.payload.field] = action.payload.value;
    },
    setCreatureHealth: (state, action: PayloadAction<number>) => {
      state.health = action.payload;
    },
    setCreaturePhysicalShield: (state, action: PayloadAction<number>) => {
      state.physicalShield = action.payload;
    },
    setCreaturePsychicShield: (state, action: PayloadAction<number>) => {
      state.psychicShield = action.payload;
    },
    setCreatureArmorCapacity: (state, action: PayloadAction<number>) => {
      state.armorCapacity = action.payload;
    },
    setCreatureChallengeLevel: (state, action: PayloadAction<string>) => {
      state.challengeLevel = action.payload;
    },
    setCreatureType: (state, action: PayloadAction<string>) => {
      state.creatureType = action.payload;
    },
    setCreatureEnvironments: (state, action: PayloadAction<string[]>) => {
      state.environments = action.payload;
    },
    setCreatureIsSwarm: (state, action: PayloadAction<boolean>) => {
      state.isSwarm = action.payload;
    },
    setCreatureIsUnique: (state, action: PayloadAction<boolean>) => {
      state.isUnique = action.payload;
    },
    addAttack: (state) => {
      state.attacks.push({ id: crypto.randomUUID(), name: '', damage: '' });
    },
    updateAttack: (state, action: PayloadAction<{ id: string; field: 'name' | 'damage'; value: string }>) => {
      const attack = state.attacks.find(a => a.id === action.payload.id);
      if (attack) attack[action.payload.field] = action.payload.value;
    },
    removeAttack: (state, action: PayloadAction<string>) => {
      state.attacks = state.attacks.filter(a => a.id !== action.payload);
    },
    addSpecialAbility: (state) => {
      state.specialAbilities.push({ id: crypto.randomUUID(), name: '', description: '' });
    },
    updateSpecialAbility: (state, action: PayloadAction<{ id: string; field: 'name' | 'description'; value: string }>) => {
      const ability = state.specialAbilities.find(a => a.id === action.payload.id);
      if (ability) ability[action.payload.field] = action.payload.value;
    },
    removeSpecialAbility: (state, action: PayloadAction<string>) => {
      state.specialAbilities = state.specialAbilities.filter(a => a.id !== action.payload);
    },
    setBasedOn: (state, action: PayloadAction<{ id: string | null; name: string | null }>) => {
      state.basedOnId = action.payload.id;
      state.basedOnName = action.payload.name;
    },
  },
});

export const {
  loadCreature,
  clearCreature,
  setCreatureName,
  setCreatureDescription,
  setCreatureScore,
  setCreatureHealth,
  setCreaturePhysicalShield,
  setCreaturePsychicShield,
  setCreatureArmorCapacity,
  setCreatureChallengeLevel,
  setCreatureType,
  setCreatureEnvironments,
  setCreatureIsSwarm,
  setCreatureIsUnique,
  addAttack,
  updateAttack,
  removeAttack,
  addSpecialAbility,
  updateSpecialAbility,
  removeSpecialAbility,
  setBasedOn,
} = customCreatureSlice.actions;

export const selectCustomCreature = (state: RootState) => state.customCreature;

export default customCreatureSlice.reducer;
```

**Step 2: Register in store**

In `src/lib/store.ts`, add the import and register the reducer:

```typescript
import customCreatureReducer from "@/lib/slices/customCreatureSlice";

// In makeStore():
reducer: {
  character: characterReducer,
  vorago: voragoReducer,
  customCreature: customCreatureReducer,
}
```

**Step 3: Verify build**

Run: `npx tsc --noEmit`
Expected: No new errors (existing `.next/dev/types` errors are pre-existing and acceptable)

**Step 4: Commit**

```bash
git add src/lib/slices/customCreatureSlice.ts src/lib/store.ts
git commit -m "feat(creature-manager): add Redux slice and register in store"
```

---

### Task 2: Create Persistence Module

**Files:**
- Create: `src/lib/customCreaturePersistence.ts`

**Step 1: Create the persistence module**

Create `src/lib/customCreaturePersistence.ts` following the patterns from `characterPersistence.ts` and `encounterPersistence.ts`:

```typescript
import { CustomCreatureState } from './slices/customCreatureSlice';

const ROSTER_KEY = 'atom-magic-custom-creatures';
const CREATURE_PREFIX = 'atom-magic-custom-creature-';
const FILE_EXTENSION = '.creatura';
const FILE_VERSION = 1;

// Roster types
export interface CustomCreatureSummary {
  id: string;
  name: string;
  challengeLevel: string;
  creatureType: string;
  health: number;
  attackCount: number;
  abilityCount: number;
  lastModified: string;
}

export interface CustomCreatureRoster {
  activeCreatureId: string | null;
  creatures: CustomCreatureSummary[];
}

// File format wrapper
interface CreatureFile {
  version: number;
  exportedAt: string;
  creature: CustomCreatureState;
}

const createEmptyRoster = (): CustomCreatureRoster => ({
  activeCreatureId: null,
  creatures: [],
});

export const getCreatureRoster = (): CustomCreatureRoster => {
  if (typeof window === 'undefined') return createEmptyRoster();
  try {
    const serialized = localStorage.getItem(ROSTER_KEY);
    if (!serialized) return createEmptyRoster();
    return JSON.parse(serialized) as CustomCreatureRoster;
  } catch (err) {
    console.error('Failed to load creature roster from localStorage:', err);
    return createEmptyRoster();
  }
};

export const saveCreatureRoster = (roster: CustomCreatureRoster): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ROSTER_KEY, JSON.stringify(roster));
  } catch (err) {
    console.error('Failed to save creature roster to localStorage:', err);
  }
};

export const getCreatureById = (id: string): CustomCreatureState | null => {
  if (typeof window === 'undefined') return null;
  try {
    const serialized = localStorage.getItem(CREATURE_PREFIX + id);
    if (!serialized) return null;
    return JSON.parse(serialized) as CustomCreatureState;
  } catch (err) {
    console.error('Failed to load creature from localStorage:', err);
    return null;
  }
};

export const saveCreatureById = (id: string, creature: CustomCreatureState): void => {
  if (typeof window === 'undefined') return;
  try {
    const now = new Date().toISOString();
    const creatureToSave = { ...creature, lastModified: now };
    localStorage.setItem(CREATURE_PREFIX + id, JSON.stringify(creatureToSave));

    // Update roster summary
    const roster = getCreatureRoster();
    const summaryIndex = roster.creatures.findIndex(c => c.id === id);
    const summary: CustomCreatureSummary = {
      id,
      name: creature.name || 'Unnamed Creature',
      challengeLevel: creature.challengeLevel || 'moderate',
      creatureType: creature.creatureType || '',
      health: creature.health || 0,
      attackCount: creature.attacks.length,
      abilityCount: creature.specialAbilities.length,
      lastModified: now,
    };

    if (summaryIndex >= 0) {
      roster.creatures[summaryIndex] = summary;
    } else {
      roster.creatures.push(summary);
    }

    saveCreatureRoster(roster);
  } catch (err) {
    console.error('Failed to save creature to localStorage:', err);
  }
};

export const deleteCreatureById = (id: string): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CREATURE_PREFIX + id);
    const roster = getCreatureRoster();
    roster.creatures = roster.creatures.filter(c => c.id !== id);
    if (roster.activeCreatureId === id) {
      roster.activeCreatureId = null;
    }
    saveCreatureRoster(roster);
  } catch (err) {
    console.error('Failed to delete creature from localStorage:', err);
  }
};

export const setActiveCreature = (id: string | null): void => {
  if (typeof window === 'undefined') return;
  try {
    const roster = getCreatureRoster();
    roster.activeCreatureId = id;
    saveCreatureRoster(roster);
  } catch (err) {
    console.error('Failed to set active creature:', err);
  }
};

export const createNewCreatureId = (): string => {
  return crypto.randomUUID();
};

export const exportCreatureToFile = (creature: CustomCreatureState): void => {
  if (typeof window === 'undefined') return;
  try {
    const fileData: CreatureFile = {
      version: FILE_VERSION,
      exportedAt: new Date().toISOString(),
      creature,
    };
    const blob = new Blob([JSON.stringify(fileData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const fileName = creature.name
      ? creature.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      : 'creature';
    link.href = url;
    link.download = `${fileName}${FILE_EXTENSION}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Failed to export creature to file:', err);
    throw new Error('Failed to export creature');
  }
};

export const importCreatureFromFile = (file: File): Promise<CustomCreatureState> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        let creature: CustomCreatureState;

        if (parsed.version && parsed.creature) {
          const fileData = parsed as CreatureFile;
          if (fileData.version > FILE_VERSION) {
            reject(new Error('This file was created with a newer version of Atom Magic. Please update to load it.'));
            return;
          }
          creature = fileData.creature;
        } else if (parsed.name !== undefined && parsed.challengeLevel !== undefined) {
          // Raw creature state (backwards compatibility)
          creature = parsed as CustomCreatureState;
        } else {
          reject(new Error('Invalid creature file format'));
          return;
        }

        if (typeof creature.name !== 'string') {
          reject(new Error('Invalid creature data: missing name'));
          return;
        }

        resolve(creature);
      } catch {
        reject(new Error('Failed to parse creature file. The file may be corrupted.'));
      }
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsText(file);
  });
};

export const getCreatureFileExtension = (): string => FILE_EXTENSION;
```

**Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: No new errors

**Step 3: Commit**

```bash
git add src/lib/customCreaturePersistence.ts
git commit -m "feat(creature-manager): add persistence module with roster, file export/import"
```

---

### Task 3: Create CustomCreatureSummaryCard Component

**Files:**
- Create: `src/app/components/creatures/CustomCreatureSummaryCard.tsx`

**Step 1: Create the summary card component**

Model after the `EncounterRoster` card rendering pattern. Each card shows: name, challenge level, creature type, HP.

```typescript
// See EncounterRoster.tsx lines 40-96 for the card pattern
// See CreatureCard.tsx lines 23-30 for challengeLevelColors
```

The card should:
- Show creature name (truncated if long)
- Show challenge level with color-coded badge (reuse `challengeLevelColors` from CreatureCard)
- Show creature type
- Show health with heart icon (mdiHeart)
- Show attack/ability counts
- Highlight active card with bronze left border accent (matching EncounterRoster pattern)
- Accept `isActive` and `onClick` props

**Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: No new errors

**Step 3: Commit**

```bash
git add src/app/components/creatures/CustomCreatureSummaryCard.tsx
git commit -m "feat(creature-manager): add CustomCreatureSummaryCard component"
```

---

### Task 4: Create CustomCreatureRoster Component

**Files:**
- Create: `src/app/components/creatures/CustomCreatureRoster.tsx`

**Step 1: Create the roster sidebar**

Model after `CharacterRoster.tsx` and `EncounterRoster.tsx`. The roster should:
- Load roster from localStorage on mount
- Display list of `CustomCreatureSummaryCard` components
- Show "New Creature" button (primary, with mdiPlus icon)
- Show "Import" button (secondary, with mdiFileImport icon)
- Hidden file input accepting `.creatura` files
- Delete button on each card (with confirmation flow, matching CharacterRoster pattern)
- Export button on each card (mdiDownload icon)
- Empty state: "No custom creatures yet" with "Create a new creature or import an existing one"
- Header: "Custom Creatures"

Props interface:
```typescript
interface CustomCreatureRosterProps {
  onCreatureSelected: (id: string) => void;
  onNewCreature: () => void;
}
```

Uses `useAppDispatch` and imports `loadCreature`, `clearCreature` from the slice.
Uses persistence functions: `getCreatureRoster`, `getCreatureById`, `deleteCreatureById`, `setActiveCreature`, `createNewCreatureId`, `importCreatureFromFile`, `saveCreatureById`, `exportCreatureToFile`.

**Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: No new errors

**Step 3: Commit**

```bash
git add src/app/components/creatures/CustomCreatureRoster.tsx
git commit -m "feat(creature-manager): add CustomCreatureRoster component"
```

---

### Task 5: Create CustomCreatureEditor Component

**Files:**
- Create: `src/app/components/creatures/CustomCreatureEditor.tsx`

**Step 1: Create the editor form**

A single scrollable form with sections. Uses `useAppSelector` to read the `customCreature` slice and `useAppDispatch` to update fields. The form auto-saves to localStorage via a `useEffect` debounce on state changes.

Sections:
1. **"Based on" reference** (conditional) - If `basedOnId` is set, show "Based on: [Name]" with link to Codex if creature exists in CMS creatures context, otherwise plain text with `basedOnName`. Uses `useCreatureData()` to look up the CMS creature.
2. **Basic Info** - Name (text input), Description (textarea), Creature Type (text input), Challenge Level (select with options: harmless, trivial, easy, moderate, hard, deadly)
3. **Scores** - 4 number inputs in a 2x2 grid: Physical, Interpersonal, Intellect, Psyche (min 1, max 100)
4. **Combat** - Health (number), Physical Shield (number), Psychic Shield (number), Armor Capacity (number)
5. **Attacks** - Inline editable list. Each row: Name input + Damage input + remove button (mdiClose). "Add Attack" button (mdiPlus) at bottom.
6. **Special Abilities** - Inline editable list. Each row: Name input + Description textarea + remove button. "Add Ability" button at bottom.
7. **Tags** - Environments (text input with add/remove chip pattern), isSwarm checkbox, isUnique checkbox
8. **Actions** - "Start from Existing" button (opens CreaturePicker - wire up in Task 7), Export button, Delete button

Props interface:
```typescript
interface CustomCreatureEditorProps {
  creatureId: string;
  onDelete: () => void;
  onStartFromExisting: () => void;
}
```

Auto-save pattern (debounced, matching Encounter Builder):
```typescript
const creature = useAppSelector(selectCustomCreature);
const saveTimeoutRef = useRef<NodeJS.Timeout>();

useEffect(() => {
  if (!creature.loaded || !creatureId) return;
  if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
  saveTimeoutRef.current = setTimeout(() => {
    saveCreatureById(creatureId, creature);
  }, 500);
  return () => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
  };
}, [creature, creatureId]);
```

Styling notes:
- Section headers: `text-xs text-stone uppercase tracking-wider mb-2` (matching Encounter Builder)
- Input styling: `w-full px-4 py-2 border-2 border-stone bg-white focus:border-bronze focus:outline-none` (matching EncounterBuilder.tsx line 249)
- Number inputs: same as text but with `type="number"` and min/max
- Section containers: `bg-parchment border-2 border-stone p-6` with `space-y-6` between sections
- Use `FunctionButton` for all buttons
- Use `IconLabel` for display items where appropriate

**Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: No new errors

**Step 3: Commit**

```bash
git add src/app/components/creatures/CustomCreatureEditor.tsx
git commit -m "feat(creature-manager): add CustomCreatureEditor form component"
```

---

### Task 6: Create CreatureManager Orchestrator

**Files:**
- Create: `src/app/components/creatures/CreatureManager.tsx`

**Step 1: Create the main orchestrator component**

This is the top-level component that manages the side-by-side layout. It orchestrates the roster and editor, handles creature selection, creation, and deletion.

Pattern follows `EncounterBuilder.tsx`:
- State: `activeCreatureId`, list of roster summaries
- Side-by-side: `grid grid-cols-1 lg:grid-cols-4 gap-8`
- Left sidebar: `lg:col-span-1` with `CustomCreatureRoster`
- Main content: `lg:col-span-3` with `CustomCreatureEditor` or empty state
- Empty state (no creature selected): Same pattern as EncounterBuilder lines 342-358 but with creature-appropriate text and mdiPlus icon

Handles:
- `handleNewCreature`: Creates new ID, dispatches `clearCreature`, sets active creature
- `handleSelectCreature`: Loads creature from localStorage, dispatches `loadCreature`, sets active
- `handleDeleteCreature`: Deletes from persistence, updates local state, clears if active
- `handleStartFromExisting`: Opens CreaturePicker state (boolean toggle)

Also handles `?clone={creatureId}` URL parameter:
```typescript
const searchParams = useSearchParams();
const cloneId = searchParams.get('clone');

useEffect(() => {
  if (cloneId && creatures) {
    const sourceCreature = creatures.find(c => c._id === cloneId);
    if (sourceCreature) {
      // Create new creature from CMS creature data
      // Map CMS fields to CustomCreatureState
      // Dispatch loadCreature, save, update roster
    }
  }
}, [cloneId, creatures]);
```

Props:
```typescript
interface CreatureManagerProps {
  creatures: CREATURES_QUERY_RESULT;
  filters: CREATURE_FILTERS_QUERY_RESULT;
}
```

**Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: No new errors

**Step 3: Commit**

```bash
git add src/app/components/creatures/CreatureManager.tsx
git commit -m "feat(creature-manager): add CreatureManager orchestrator with layout"
```

---

### Task 7: Create CreaturePicker Modal

**Files:**
- Create: `src/app/components/creatures/CreaturePicker.tsx`

**Step 1: Create the creature picker**

A modal/overlay that lets users browse and select a CMS creature to clone. Reuses the `CreatureFilters` component for filtering.

Structure:
- Overlay/modal with dark backdrop
- Header: "Choose a Creature to Customize"
- `CreatureFilters` component for filter controls
- Grid of creature cards (compact version - just name, type, challenge level, and a "Select" button)
- Close button

Props:
```typescript
interface CreaturePickerProps {
  creatures: CREATURES_QUERY_RESULT;
  filters: CREATURE_FILTERS_QUERY_RESULT;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (creature: CREATURES_QUERY_RESULT[number]) => void;
}
```

Filtering logic: Reuse the same `useMemo` filter pattern from `CreatureRoller.tsx` (filter by environment, type, challenge level).

**Step 2: Wire up CreaturePicker in CreatureManager**

In `CreatureManager.tsx`, add state `showPicker` and render `CreaturePicker` when true. The `onSelect` callback should:
1. Create a new creature ID
2. Map the CMS creature fields to `CustomCreatureState`
3. Set `basedOnId` and `basedOnName`
4. Dispatch `loadCreature`
5. Save to localStorage
6. Close the picker

Also wire up `onStartFromExisting` in the editor to toggle `showPicker`.

**Step 3: Verify build**

Run: `npx tsc --noEmit`
Expected: No new errors

**Step 4: Commit**

```bash
git add src/app/components/creatures/CreaturePicker.tsx src/app/components/creatures/CreatureManager.tsx
git commit -m "feat(creature-manager): add CreaturePicker modal for clone-from-existing"
```

---

### Task 8: Create Page Route and Wrapper

**Files:**
- Create: `src/app/(website)/(creature-tools)/creatures/manager/page.tsx`
- Create: `src/app/(website)/(creature-tools)/creatures/manager/CreatureManagerWrapper.tsx`

**Step 1: Create the wrapper component**

Following the pattern from `CreatureRollerWrapper.tsx` - a 'use client' component that reads from `CreatureDataContext` and passes data to `CreatureManager`:

```typescript
'use client';

import { useCreatureData } from '@/app/components/creatures/CreatureDataContext';
import CreatureManager from '@/app/components/creatures/CreatureManager';

export default function CreatureManagerWrapper() {
  const { creatures, filters } = useCreatureData();
  return <CreatureManager creatures={creatures} filters={filters} />;
}
```

**Step 2: Create the page component**

Following the pattern from the encounters page (`src/app/(website)/(creature-tools)/encounters/page.tsx`):

```typescript
import { Metadata } from 'next';
import PageHero from '@/app/components/common/PageHero';
import { mdiPaw } from '@mdi/js';
import CreatureManagerWrapper from './CreatureManagerWrapper';

export const metadata: Metadata = {
  title: 'Creature Manager | Atom Magic',
  description:
    'Create, customize, and manage your own creatures for Atom Magic campaigns. Build custom monsters and NPCs for your encounters.',
};

export default function Page() {
  return (
    <main className="min-h-screen bg-parchment">
      <PageHero
        title="Creature Manager"
        description="Create and customize your own creatures for campaigns. Build custom monsters and NPCs, or start from an existing Codex creature and make it your own."
        icon={mdiPaw}
        accentColor="bronze"
      />
      <section className="container px-6 md:px-8 py-12">
        <CreatureManagerWrapper />
      </section>
    </main>
  );
}
```

**Step 3: Verify it loads**

Run: `npm run dev`
Navigate to: `http://localhost:3000/creatures/manager`
Expected: Page loads with PageHero and empty state

**Step 4: Commit**

```bash
git add src/app/\(website\)/\(creature-tools\)/creatures/manager/
git commit -m "feat(creature-manager): add page route and wrapper"
```

---

### Task 9: Add Navigation Links

**Files:**
- Modify: `src/app/components/global/Footer.tsx`

**Step 1: Add Creature Manager to footer navigation**

In `Footer.tsx`, add the Creature Manager link to the `toolLinks` array, after the Encounter Builder entry:

```typescript
{ href: '/creatures/manager', name: 'Creature Manager' },
```

Place it after `{ href: '/encounters', name: 'Encounter Builder' }` (line 28).

**Step 2: Verify navigation**

Run: `npm run dev`
Navigate to footer, verify "Creature Manager" link appears and works.

**Step 3: Commit**

```bash
git add src/app/components/global/Footer.tsx
git commit -m "feat(creature-manager): add navigation link in footer"
```

---

### Task 10: Add "Customize" Button to CreatureCard

**Files:**
- Modify: `src/app/components/creatures/CreatureCard.tsx`

**Step 1: Add the Customize button**

Add an optional `showCustomize` prop (default false) and render a "Customize" link button when true. Place it next to the existing "View full Codex entry" link.

```typescript
interface CreatureCardProps {
  creature: Creature;
  isSelected?: boolean;
  showCustomize?: boolean;
}
```

Add after the Codex link (around line 225):
```tsx
{showCustomize && (
  <Link
    href={`/creatures/manager?clone=${creature._id}`}
    className="inline-flex items-center gap-1 text-sm text-bronze hover:text-gold transition-colors ml-4"
  >
    Customize
    <Icon path={mdiPencil} size={0.5} />
  </Link>
)}
```

Import `mdiPencil` from `@mdi/js`.

**Step 2: Enable showCustomize in CreatureRoller**

In `CreatureRoller.tsx`, pass `showCustomize={true}` to CreatureCard instances. Find where `<CreatureCard` is rendered and add the prop.

**Step 3: Verify the Customize button**

Run: `npm run dev`
Navigate to `/creatures`, roll or show a creature, verify "Customize" link appears and navigates to `/creatures/manager?clone={id}`.

**Step 4: Commit**

```bash
git add src/app/components/creatures/CreatureCard.tsx src/app/components/creatures/CreatureRoller.tsx
git commit -m "feat(creature-manager): add Customize button to CreatureCard"
```

---

### Task 11: Manual Testing and Polish

**Step 1: Test core flows**

Test each of these scenarios manually:
1. Create a new creature, fill in all fields, verify it saves and appears in roster
2. Select a different creature from roster, verify editor loads its data
3. Delete a creature, verify it's removed from roster and localStorage
4. Export a creature to `.creatura` file, verify the file downloads
5. Import the `.creatura` file, verify it appears in roster
6. Click "Customize" on a creature in the roller, verify it navigates and pre-populates
7. Use "Start from Existing" in the editor, verify picker opens, select a creature, verify fields populate with "Based on" reference
8. Resize browser to mobile width, verify layout stacks vertically
9. Refresh the page, verify active creature persists

**Step 2: Fix any issues found during testing**

Address any bugs or UX issues discovered.

**Step 3: Verify production build**

Run: `npm run build`
Expected: Build succeeds with no errors

**Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix(creature-manager): polish and testing fixes"
```

---

### Task 12: Update ROADMAP.md and CLAUDE.md

**Files:**
- Modify: `ROADMAP.md`
- Modify: `CLAUDE.md`

**Step 1: Update ROADMAP.md**

Check off the completed Creature Manager items:
- [x] **Creature editor**
- [x] **Modify existing creatures**
- [x] **Creature roster**
- [x] **Creature stat block** (the editor form serves as the stat block view)

**Step 2: Update CLAUDE.md**

Add Creature Manager to the Key File Locations table:

```markdown
### Creature Manager
| What | File |
|------|------|
| Redux state | `src/lib/slices/customCreatureSlice.ts` |
| Persistence | `src/lib/customCreaturePersistence.ts` |
| Main orchestrator | `src/app/components/creatures/CreatureManager.tsx` |
| Editor form | `src/app/components/creatures/CustomCreatureEditor.tsx` |
| Roster sidebar | `src/app/components/creatures/CustomCreatureRoster.tsx` |
| Clone picker | `src/app/components/creatures/CreaturePicker.tsx` |
```

Also add to the "Recent Changes" section:
- Creature Manager added for custom creature creation, editing, roster management, and file export/import

**Step 3: Commit**

```bash
git add ROADMAP.md CLAUDE.md
git commit -m "docs: update ROADMAP.md and CLAUDE.md with Creature Manager"
```
