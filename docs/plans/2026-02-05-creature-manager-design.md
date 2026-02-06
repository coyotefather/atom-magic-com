# Creature Manager Design

A tool for GMs to create, customize, and manage custom creatures - analogous to the Character Manager but for monsters and NPCs.

## Data Model

### Custom Creature State (Redux)

```typescript
interface CustomCreatureState {
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
  attacks: { name: string; damage: string }[];
  specialAbilities: { name: string; description: string }[];
  // Tags
  challengeLevel: string;
  creatureType: string;
  environments: string[];
  isSwarm: boolean;
  isUnique: boolean;
  // Reference
  basedOnId: string | null;    // CMS creature _id
  basedOnName: string | null;  // Cached name (survives CMS deletion)
  // Meta
  lastModified: string;
}
```

### Roster Summary

```typescript
interface CustomCreatureSummary {
  id: string;
  name: string;
  challengeLevel: string;
  creatureType: string;
  health: number;
  attackCount: number;
  abilityCount: number;
  lastModified: string;
}

interface CustomCreatureRoster {
  activeCreatureId: string | null;
  creatures: CustomCreatureSummary[];
}
```

### Persistence

- Storage keys: `atom-magic-custom-creatures` (roster), `atom-magic-custom-creature-{id}` (individual)
- Same roster/detail pattern as Character Manager and Encounter Builder
- File export/import with `.creatura` extension and versioned wrapper

## Page & Route

- Route: `/creatures/manager` inside existing `(creature-tools)` route group
- Reuses `CreatureDataContext` from the layout for CMS creature access
- PageHero: `accentColor="bronze"`, `variant="full"`, `theme="dark"`

## Layout

Side-by-side on desktop, stacked on mobile:

```
┌─────────────────────┬──────────────────────────────────────┐
│  Creature Roster    │  Creature Editor                     │
│  (left sidebar)     │  (scrollable form)                   │
│                     │                                      │
│  [+ New Creature]   │  "Based on: Lupus Magnus"  (if any)  │
│  [Import .creatura] │                                      │
│                     │  --- Basic Info ---                   │
│  ┌───────────────┐  │  Name, Description, Type,            │
│  │ Lupus Custom  │  │  Challenge Level                     │
│  │ Hard · Beast  │  │                                      │
│  │ HP: 45        │  │  --- Scores ---                      │
│  └───────────────┘  │  Physical, Interpersonal,            │
│                     │  Intellect, Psyche                   │
│  ┌───────────────┐  │                                      │
│  │ Fire Golem    │  │  --- Combat ---                      │
│  │ Deadly · Con  │  │  Health, Shields, Armor              │
│  │ HP: 80        │  │                                      │
│  └───────────────┘  │  --- Attacks ---                     │
│                     │  [Name] [Damage]  x                  │
│                     │  [Name] [Damage]  x                  │
│                     │  [+ Add Attack]                      │
│                     │                                      │
│                     │  --- Special Abilities ---            │
│                     │  [Name] [Description]  x             │
│                     │  [+ Add Ability]                      │
│                     │                                      │
│                     │  --- Tags ---                         │
│                     │  Environments, Swarm, Unique          │
│                     │                                      │
│                     │  [Export] [Delete]                    │
└─────────────────────┴──────────────────────────────────────┘
```

## Components

All in `src/app/components/creatures/`:

| Component | Purpose |
|-----------|---------|
| `CreatureManager.tsx` | Main orchestrator, side-by-side layout |
| `CustomCreatureRoster.tsx` | Left sidebar with summary cards, new/import buttons |
| `CustomCreatureSummaryCard.tsx` | Compact roster card (name, challenge, type, HP) |
| `CustomCreatureEditor.tsx` | Single scrollable form with all fields |
| `CreaturePicker.tsx` | Modal for "start from existing" with filters |

### Modified existing components

| Component | Change |
|-----------|--------|
| `CreatureCard.tsx` | Add "Customize" button linking to `/creatures/manager?clone={id}` |

## State Management

Redux slice at `src/lib/slices/customCreatureSlice.ts`:
- Follows Character Manager patterns (load, clear, field setters)
- Registered in `src/lib/store.ts`
- Enables future integration with Encounter Builder via `useSelector`

## Key Interactions

### Creating a new creature
- Click "+ New Creature" in roster
- Defaults: empty name, scores at 10, challengeLevel "moderate", empty attacks/abilities
- Immediately active in editor, cursor focused on name field

### Starting from existing (within manager)
- "Start from existing" button at top of editor opens CreaturePicker
- Picker reuses existing CreatureFilters for filtering CMS creatures
- Selecting a creature populates all fields, sets basedOnId and basedOnName

### Starting from existing (from roller/cards)
- "Customize" button on CreatureCard
- Links to `/creatures/manager?clone={creatureId}`
- Manager reads query param, creates new custom creature pre-populated from CMS creature

### "Based on" display
- Source creature found in context: "Based on: [Name]" as Codex link
- Source creature removed from CMS: "Based on: [basedOnName]" as plain text
- No reference: nothing shown

### Auto-save
- Changes persist to localStorage on every field change (debounced)
- Matches Encounter Builder behavior

### Delete
- Confirmation dialog before removal
- Removes from localStorage and roster

### Export/Import
- Export: `.creatura` file with versioned wrapper (`{ version, exportedAt, creature }`)
- Import: validates file, adds to roster, opens in editor

## File Structure

```
src/
├── lib/
│   ├── slices/
│   │   └── customCreatureSlice.ts      # Redux slice
│   ├── customCreaturePersistence.ts     # localStorage + file I/O
│   └── store.ts                        # Register new reducer
├── app/
│   ├── (website)/(creature-tools)/
│   │   └── creatures/
│   │       └── manager/
│   │           └── page.tsx            # Page component
│   └── components/creatures/
│       ├── CreatureManager.tsx          # Main layout orchestrator
│       ├── CustomCreatureRoster.tsx     # Sidebar roster
│       ├── CustomCreatureSummaryCard.tsx # Roster cards
│       ├── CustomCreatureEditor.tsx     # Editor form
│       ├── CreaturePicker.tsx           # Clone-from-existing modal
│       └── CreatureCard.tsx             # (modify) Add Customize button
```

## Future Integration (not in this build)

- **Encounter Builder**: Merge custom creatures into creature selector via Redux
- **Shareable creatures**: URL/QR sharing following shareable characters pattern
- **Creature templates**: Quick presets (minion, elite, boss) that scale base stats

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Clone strategy | Clone with reference | Full data independence + "Based on" context; graceful fallback if source removed |
| Route location | Inside `(creature-tools)` group | Reuses CMS creature data fetching; groups creature tools together |
| Editor layout | Single scrollable form | ~15-20 fields fits comfortably; no need for wizard or tabs |
| State management | Redux slice | Consistent with Character Manager; enables cross-tool integration |
| Page layout | Side-by-side (responsive) | Quick switching between creatures; stacks on mobile |
| Array editing | Inline editable lists | 2-field entries don't warrant modals |
| File extension | `.creatura` | Latin-themed parallel to `.solum` |
