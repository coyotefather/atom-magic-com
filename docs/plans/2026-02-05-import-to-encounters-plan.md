# Import Custom Creatures to Encounter Builder - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Allow GMs to add their custom creatures from the Creature Manager into encounters alongside CMS creatures.

**Architecture:** Add a `source` field to `EncounterCreature`, refactor `CreatureSelector` with tabs for Codex vs Custom creatures, and wire custom creature data from localStorage into the Encounter Builder.

**Tech Stack:** React, TypeScript, Tailwind CSS 4, localStorage

---

## Context

### Key Files
| File | Purpose |
|------|---------|
| `src/lib/encounter-data.ts` | `EncounterCreature` interface, threat calc utilities |
| `src/app/components/encounters/EncounterBuilder.tsx` | Main orchestrator, `handleAddCreature` |
| `src/app/components/encounters/CreatureSelector.tsx` | Filterable grid for adding CMS creatures |
| `src/app/components/encounters/EncounterCreatureList.tsx` | Displays creatures in current encounter |
| `src/lib/customCreaturePersistence.ts` | `getCreatureRoster()`, `CustomCreatureSummary` |

### Current EncounterCreature Interface
```typescript
export interface EncounterCreature {
  creatureId: string;      // Sanity _id
  name: string;            // Cached
  challengeLevel: string;  // For threat calc
  quantity: number;
}
```

### CustomCreatureSummary Interface (from Creature Manager)
```typescript
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
```

---

### Task 1: Add `source` field to EncounterCreature

**Files:**
- Modify: `src/lib/encounter-data.ts:24-30`

**What to do:**

Add `source` field to the `EncounterCreature` interface:

```typescript
export interface EncounterCreature {
  creatureId: string;
  name: string;
  challengeLevel: string;
  quantity: number;
  source?: 'cms' | 'custom';  // Optional for backwards compat, defaults to 'cms'
}
```

Make it optional (`source?`) so existing saved encounters without this field still work — they'll be treated as `'cms'`.

Update the `generateEncounterSummary` function to include a `[Custom]` marker for custom creatures:

In the creature line (around line 145), change:
```typescript
// Before:
lines.push(`- ${creature.name} (${creature.challengeLevel}) x${creature.quantity} = ${threatPoints} pts`);

// After:
const customTag = creature.source === 'custom' ? ' [Custom]' : '';
lines.push(`- ${creature.name}${customTag} (${creature.challengeLevel}) x${creature.quantity} = ${threatPoints} pts`);
```

**Verify:** Run `npx tsc --noEmit` — should pass with only pre-existing errors.

**Commit:** `feat: add source field to EncounterCreature interface`

---

### Task 2: Add "Custom" badge to EncounterCreatureList

**Files:**
- Modify: `src/app/components/encounters/EncounterCreatureList.tsx:57-73`

**What to do:**

In the creature info section (inside the `.map` callback, around line 58-73), add a "Custom" badge next to the creature name when `source === 'custom'`.

Change the creature name display from:
```tsx
<div className="font-semibold text-black truncate">
  {creature.name}
</div>
```

To:
```tsx
<div className="font-semibold text-black truncate flex items-center gap-2">
  {creature.name}
  {creature.source === 'custom' && (
    <span className="px-1.5 py-0.5 text-xs bg-bronze/20 text-bronze uppercase tracking-wider shrink-0">
      Custom
    </span>
  )}
</div>
```

**Verify:** Run `npx tsc --noEmit` — should pass with only pre-existing errors.

**Commit:** `feat: show Custom badge on encounter creatures from Creature Manager`

---

### Task 3: Add tabs to CreatureSelector

**Files:**
- Modify: `src/app/components/encounters/CreatureSelector.tsx`

**What to do:**

This is the main UI change. The CreatureSelector needs:
1. A new prop for custom creatures
2. Tab state to switch between Codex and Custom views
3. A custom creatures tab panel
4. A modified callback to include source information

**Step 1: Update imports and props**

Add import at top of file:
```typescript
import Link from 'next/link';
import { CustomCreatureSummary } from '@/lib/customCreaturePersistence';
```

Update the props interface:
```typescript
interface CreatureSelectorProps {
  creatures: CREATURES_QUERY_RESULT;
  filters: CREATURE_FILTERS_QUERY_RESULT;
  onAddCreature: (creature: Creature) => void;
  customCreatures: CustomCreatureSummary[];
  onAddCustomCreature: (creature: CustomCreatureSummary) => void;
}
```

Update destructuring:
```typescript
const CreatureSelector = ({
  creatures,
  filters,
  onAddCreature,
  customCreatures,
  onAddCustomCreature,
}: CreatureSelectorProps) => {
```

**Step 2: Add tab state**

Add after the existing `useState` declarations (around line 38):
```typescript
const [activeTab, setActiveTab] = useState<'codex' | 'custom'>('codex');
```

**Step 3: Add tab UI**

Inside the `{isExpanded && (` block, right at the start of `<div className="px-4 pb-4">`, add tabs before the filters:

```tsx
{/* Tabs */}
<div className="flex border-b-2 border-stone/30 mb-4">
  <button
    onClick={() => setActiveTab('codex')}
    className={`px-4 py-2 text-sm marcellus uppercase tracking-wider transition-colors ${
      activeTab === 'codex'
        ? 'border-b-2 border-bronze text-bronze -mb-[2px]'
        : 'text-stone hover:text-black'
    }`}
  >
    Codex Creatures ({creatures.length})
  </button>
  <button
    onClick={() => setActiveTab('custom')}
    className={`px-4 py-2 text-sm marcellus uppercase tracking-wider transition-colors ${
      activeTab === 'custom'
        ? 'border-b-2 border-bronze text-bronze -mb-[2px]'
        : 'text-stone hover:text-black'
    }`}
  >
    Custom Creatures ({customCreatures.length})
  </button>
</div>
```

**Step 4: Wrap existing filters + grid in Codex tab conditional**

Wrap the entire existing content (filters `<div className="space-y-4 mb-6">`, creature count, creature grid, and show more button) in:
```tsx
{activeTab === 'codex' && (
  <>
    {/* ...existing filters, count, grid, show more... */}
  </>
)}
```

**Step 5: Add Custom Creatures tab panel**

After the Codex tab panel, add:
```tsx
{activeTab === 'custom' && (
  <div>
    {customCreatures.length === 0 ? (
      <div className="text-center py-8">
        <p className="text-sm text-stone mb-2">No custom creatures yet.</p>
        <Link
          href="/creatures/manager"
          className="text-sm text-bronze hover:text-gold transition-colors"
        >
          Create one in the Creature Manager
        </Link>
      </div>
    ) : (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {customCreatures.map(creature => {
          const challengeLevel = creature.challengeLevel || 'moderate';
          const threatPts = THREAT_VALUES[challengeLevel] || 0;

          return (
            <button
              key={creature.id}
              onClick={() => onAddCustomCreature(creature)}
              className="group text-left p-3 bg-white border-2 border-stone/50 hover:border-bronze transition-colors"
            >
              <div className="flex items-start justify-between gap-1">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-black truncate">
                    {creature.name || 'Unnamed Creature'}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`px-1.5 py-0.5 text-xs ${getChallengeLevelColor(
                        challengeLevel
                      )}`}
                    >
                      {challengeLevelLabels[challengeLevel] || challengeLevel}
                    </span>
                    <span className="text-xs text-stone">
                      {threatPts} pts
                    </span>
                  </div>
                  {creature.creatureType && (
                    <div className="text-xs text-stone mt-1 truncate">
                      {creature.creatureType}
                    </div>
                  )}
                </div>
                <div className="p-1 text-stone group-hover:text-bronze transition-colors">
                  <Icon path={mdiPlus} size={0.625} />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    )}
  </div>
)}
```

**Verify:** Run `npx tsc --noEmit` — will show errors because EncounterBuilder doesn't pass the new props yet. That's expected and will be fixed in Task 4.

**Commit:** `feat: add tabbed Codex/Custom creature selector for encounters`

---

### Task 4: Wire custom creatures into EncounterBuilder

**Files:**
- Modify: `src/app/components/encounters/EncounterBuilder.tsx`

**What to do:**

**Step 1: Add imports**

Add to existing imports:
```typescript
import {
  getCreatureRoster,
  CustomCreatureSummary,
} from '@/lib/customCreaturePersistence';
```

**Step 2: Add state for custom creatures**

After the existing `useState` declarations (around line 42), add:
```typescript
const [customCreatures, setCustomCreatures] = useState<CustomCreatureSummary[]>([]);
```

**Step 3: Load custom creatures on mount**

Inside the existing `useEffect` (lines 45-57), after the encounter roster loading, add:
```typescript
// Load custom creatures from localStorage
const creatureRoster = getCreatureRoster();
setCustomCreatures(creatureRoster.creatures);
```

**Step 4: Add handler for custom creatures**

After `handleAddCreature` (around line 152), add a new handler:

```typescript
// Add custom creature to encounter
const handleAddCustomCreature = (creature: CustomCreatureSummary) => {
  if (!currentEncounter) return;

  const existingIdx = currentEncounter.creatures.findIndex(
    c => c.creatureId === creature.id && c.source === 'custom'
  );

  let updatedCreatures: EncounterCreature[];
  if (existingIdx >= 0) {
    updatedCreatures = [...currentEncounter.creatures];
    updatedCreatures[existingIdx] = {
      ...updatedCreatures[existingIdx],
      quantity: updatedCreatures[existingIdx].quantity + 1,
    };
  } else {
    const newCreature: EncounterCreature = {
      creatureId: creature.id,
      name: creature.name || 'Unnamed Creature',
      challengeLevel: creature.challengeLevel || 'moderate',
      quantity: 1,
      source: 'custom',
    };
    updatedCreatures = [...currentEncounter.creatures, newCreature];
  }

  const updated = { ...currentEncounter, creatures: updatedCreatures };
  setCurrentEncounter(updated);
  saveCurrentEncounter(updated);
};
```

**Step 5: Update existing handleAddCreature to set source**

In the existing `handleAddCreature` (line 140), add `source: 'cms'` to the new creature:
```typescript
const newCreature: EncounterCreature = {
  creatureId: creature._id,
  name: creature.name || 'Unknown',
  challengeLevel: creature.challengeLevel || 'moderate',
  quantity: 1,
  source: 'cms',
};
```

Also update the `findIndex` check (line 126-128) to also match on source, so a CMS creature and custom creature with the same ID don't collide:
```typescript
const existingIdx = currentEncounter.creatures.findIndex(
  c => c.creatureId === creature._id && c.source !== 'custom'
);
```

**Step 6: Pass new props to CreatureSelector**

Update the `<CreatureSelector>` JSX (around line 285-289):
```tsx
<CreatureSelector
  creatures={creatures}
  filters={filters}
  onAddCreature={handleAddCreature}
  customCreatures={customCreatures}
  onAddCustomCreature={handleAddCustomCreature}
/>
```

**Verify:** Run `npx tsc --noEmit` — should pass with only pre-existing errors. All new props are now connected.

**Commit:** `feat: wire custom creatures into Encounter Builder`

---

### Task 5: Update ROADMAP.md and CLAUDE.md

**Files:**
- Modify: `ROADMAP.md`
- Modify: `CLAUDE.md`

**What to do:**

In `ROADMAP.md`, check off the import-to-encounters item:
```markdown
- [x] **Import to encounters** - Use custom creatures in the Encounter Builder
```

In `CLAUDE.md`, in the "Recent Changes" section, add:
```
- Custom creatures can be added to encounters via tabbed creature selector
```

**Verify:** Run `npm run build` to confirm the full production build passes.

**Commit:** `docs: mark import-to-encounters complete and update CLAUDE.md`
