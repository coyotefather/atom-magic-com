# Import Custom Creatures to Encounter Builder - Design

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Allow GMs to use their custom creatures from the Creature Manager in the Encounter Builder.

**Architecture:** Add a `source` field to `EncounterCreature`, add a tabbed interface to `CreatureSelector`, and wire custom creature data from localStorage into the Encounter Builder.

---

## Data Model

The `EncounterCreature` interface gains a `source` field:

```typescript
export interface EncounterCreature {
  creatureId: string;
  name: string;
  challengeLevel: string;
  quantity: number;
  source: 'cms' | 'custom';
}
```

- All existing encounters default to `source: 'cms'` (backwards compatible — missing field treated as `'cms'`)
- Custom creatures use their localStorage UUID as `creatureId`
- Cached `name` and `challengeLevel` survive even if the custom creature is deleted from the Creature Manager

## CreatureSelector Tabs

The `CreatureSelector` component gets a tabbed interface:

- **Codex Creatures tab** (default): Existing filterable grid of CMS creatures, unchanged
- **Custom Creatures tab**: Shows custom creature roster from localStorage
  - Simpler list (no full filter sidebar — typically fewer creatures)
  - Each entry: name, challenge level badge, creature type, "Add" button
  - Empty state: "No custom creatures yet." with link to `/creatures/manager`
- Tab styling: underline-style with `border-b-2 border-bronze` active, `text-stone` inactive
- Tab labels show counts: "Codex Creatures (47)" / "Custom Creatures (3)"

New prop: `customCreatures` (custom creature roster summaries from localStorage)

## EncounterBuilder Wiring

- On mount, loads custom creature summaries via `getCreatureRoster()` from `customCreaturePersistence.ts`
- Passes custom creatures to `CreatureSelector`
- `handleAddCreature` updated to set `source: 'custom'` or `source: 'cms'` based on which tab the creature came from

## EncounterCreatureList Display

- Renders a small "Custom" badge (`bg-bronze/20 text-bronze`) next to the creature name when `source === 'custom'`
- All other display and controls identical to CMS creatures

## No Changes Required

- **EncounterRoster**: Threat calculations use `challengeLevel` regardless of source
- **encounterPersistence.ts**: `EncounterCreature` just has the new field; existing data without it defaults to `'cms'`
- **Threat calculations**: `THREAT_VALUES` and difficulty thresholds work purely on `challengeLevel`
- **EncounterBuilderWrapper**: Custom creatures come from localStorage (client-side), not CMS context

## Deleted Custom Creatures

If a custom creature is deleted from the Creature Manager but exists in an encounter:
- Encounter still works — cached `name` and `challengeLevel` are preserved
- Threat calculations unaffected
- Full detail lookup returns null (handled gracefully)
