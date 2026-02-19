# Campaign Dashboard Design

**Date:** 2026-02-18
**Status:** Approved

## Overview

A new `/campaign` page that links Adventure Log sessions into a single campaign, tracks the party roster, and surfaces key events across sessions. Single-campaign for v1 (no multi-campaign roster).

## Approach

Option B — Sessions get a `campaignId` field. The campaign is stored as a standalone localStorage entry. Sessions store a `campaignId` to indicate they belong to the campaign. This enables bidirectional discovery: the Campaign Dashboard queries sessions by `campaignId`, and the Adventure Log session roster shows a badge on linked sessions.

## Data Model

### `Campaign` type (new)

```typescript
interface Campaign {
  id: string;
  name: string;
  description?: string;
  partyCharacterIds: string[];   // IDs from character roster (characterPersistence)
  createdAt: string;             // ISO timestamp
  lastModified: string;          // ISO timestamp
}
```

Stored at `localStorage['atom-magic-campaign']`.

### `Session` type (updated)

Add one optional field to the existing `Session` interface in `adventure-log-data.ts`:

```typescript
campaignId?: string;   // links this session to the campaign
```

No migration needed — existing sessions without the field treat it as `undefined`.

## Persistence (`src/lib/campaignPersistence.ts`)

New file with these functions:

- `getCampaign(): Campaign | null`
- `saveCampaign(campaign: Campaign): void`
- `deleteCampaign(): void`
- `linkSessionToCampaign(sessionId: string, campaignId: string): void` — loads session from localStorage, sets `campaignId`, saves back
- `unlinkSessionFromCampaign(sessionId: string): void` — clears `campaignId` from session
- `getLinkedSessions(campaignId: string): SessionSummary[]` — reads roster, filters by `campaignId`

## Page Layout

**Route:** `src/app/(website)/campaign/page.tsx`
**Main component:** `src/app/components/campaign/CampaignDashboard.tsx`
**PageHero:** laurel accent, full variant, light theme (matching Map page)

### Empty state

Centered empty state with a "Create Campaign" button, consistent with Adventure Log's empty state pattern.

### Active state (three sections, single-column)

```
PageHero
─────────────────────────────────────────
Campaign Header Card
  - Editable campaign name (large input, marcellus)
  - Editable description (textarea)
  - Created date display
  - Delete Campaign button (danger, confirmation required)
─────────────────────────────────────────
Party Roster Section
  - Compact read-only character cards (name, culture, path)
  - "Add Character" dropdown picking from saved characters
  - "Remove" button on each card
─────────────────────────────────────────
Sessions Section
  - Dropdown of unlinked sessions + "Link" button
  - Linked sessions listed as cards (sorted by date, newest last)
    - Session name, date, entry count, key event count
    - Key events listed inline (collapsed, expandable)
    - "Unlink" button
```

## Component Breakdown

| Component | Responsibility |
|-----------|---------------|
| `CampaignDashboard.tsx` | Orchestrator — loads campaign + linked sessions, manages state |
| `CampaignHeader.tsx` | Editable campaign name + description, delete button |
| `PartyRoster.tsx` | Character picker dropdown, character cards, remove action |
| `SessionLinker.tsx` | Unlinked session dropdown, link action, linked session cards with key events |

## Adventure Log Changes

`SessionRoster.tsx` — add a small "Campaign" badge (e.g., `mdiBookOpenPageVariant` icon + "Campaign" label) on sessions that have a `campaignId` set. No other changes.

## Navigation

- Add "Campaign Dashboard" card to `/tools` page
- Add "Campaign" link to site nav near "Adventure Log"
- MDI icon: `mdiMapMarkerMultiple` (or similar compass/map icon)

## Files Changed

| File | Action |
|------|--------|
| `src/lib/adventure-log-data.ts` | Add `campaignId?: string` to `Session` interface |
| `src/lib/campaignPersistence.ts` | **New** — campaign CRUD + session linking |
| `src/app/(website)/campaign/page.tsx` | **New** — page route with metadata |
| `src/app/components/campaign/CampaignDashboard.tsx` | **New** — main orchestrator |
| `src/app/components/campaign/CampaignHeader.tsx` | **New** — editable name/description card |
| `src/app/components/campaign/PartyRoster.tsx` | **New** — character picker + read-only cards |
| `src/app/components/campaign/SessionLinker.tsx` | **New** — link/unlink sessions, key event display |
| `src/app/components/adventure-log/SessionRoster.tsx` | Minor — campaign badge on linked sessions |
| `src/app/(website)/tools/page.tsx` | Add Campaign Dashboard link |

## Out of Scope (v1)

- Multiple campaigns
- Campaign export/import
- Cross-campaign statistics
- Shareable campaign URLs
