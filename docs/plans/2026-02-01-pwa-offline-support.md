# PWA Offline Support Design

## Overview

Add service worker-based offline caching to Atom Magic, enabling users to access Codex content and tools during game sessions or while traveling without reliable internet.

## Goals

- Pre-cache essential tools and core Codex content on first visit
- Cache additional pages on demand as users visit them
- Show clear offline messages for network-dependent features
- No "install as app" experience - just offline caching

## Non-Goals

- Installable PWA with manifest/icons
- Offline Vorago AI opponent
- Offline Algolia search
- Push notifications

## Caching Strategy

### Tiers

| Tier | Strategy | Content |
|------|----------|---------|
| Static assets | CacheFirst (30 day expiry) | CSS, JS, fonts |
| Images | CacheFirst (30 day expiry) | Local images |
| Sanity CDN images | CacheFirst (7 day expiry) | CMS images |
| Pre-cached pages | StaleWhileRevalidate | Tools + core Codex |
| On-demand pages | StaleWhileRevalidate | Other pages when visited |
| API routes | NetworkOnly | Never cached |

### Pre-cached Pages

**Static Tools:**
- `/tools/dice` - Dice Roller
- `/tools/loot` - Loot Roller
- `/tools/reference` - Quick Reference
- `/character` - Character Manager

**Core Codex Content:**
- `/codex/cultures/*` - All culture entries (~4)
- `/codex/paths/*` - All path entries (~3)
- `/codex/disciplines/*` - All discipline entries (~13)
- `/codex/cardinals/*` - All cardinal entries (~13)
- `/codex/rolling-guides` - Rolling guides
- `/codex/getting-started` - Getting started guide

**Estimated pre-cache size:** 3-5MB

### Cache-on-Demand

Everything else gets cached when visited:
- Individual techniques
- Creatures
- Other Codex entries
- Vorago (limited use offline anyway)

### Cache Invalidation

- Service worker regenerates on each deploy (build hash changes)
- StaleWhileRevalidate ensures content updates propagate on next visit
- For Sanity-only content changes, no deploy needed - caching strategy handles it

## Offline Behavior

### Detection

React context (`OfflineContext`) listens to browser `online`/`offline` events and exposes status to components.

### Feature-Specific Handling

| Feature | Offline Behavior |
|---------|------------------|
| Algolia search | Search bar shows "Search unavailable offline" |
| Vorago AI opponent | Difficulty selector disabled with tooltip |
| Contact form | Submit button disabled with message |
| Uncached pages | Redirect to offline fallback page |

### Offline Fallback Page

Simple page at `/offline` explaining:
- "This page isn't available offline"
- Suggest accessing cached pages or reconnecting

No persistent global "offline" banner - only contextual messages where functionality is impacted.

## Technical Implementation

### Dependencies

```bash
npm install @serwist/next serwist
```

### Files to Create

| File | Purpose |
|------|---------|
| `src/app/sw.ts` | Service worker entry point |
| `src/lib/contexts/OfflineContext.tsx` | React context for offline state |
| `src/app/offline/page.tsx` | Offline fallback page |

### Files to Modify

| File | Changes |
|------|---------|
| `next.config.mjs` | Add Serwist plugin |
| `tsconfig.json` | Add service worker types |
| Search component | Check `isOffline`, show message |
| Vorago difficulty selector | Disable AI when offline |
| Contact form | Disable submit when offline |

### Service Worker Configuration

```typescript
// Caching rules (pseudocode)
- Static assets: CacheFirst, maxAge 30 days
- Images: CacheFirst, maxAge 30 days
- Sanity CDN: CacheFirst, maxAge 7 days
- Pages: StaleWhileRevalidate
- /api/*: NetworkOnly
```

## Testing

1. Chrome DevTools → Application → Service Workers
2. Check "Offline" to simulate offline state
3. Verify:
   - Pre-cached pages load offline
   - Visited pages are cached and load offline
   - Unvisited pages show offline fallback
   - Network-dependent features show appropriate messages

## Future Considerations

- Revisit pre-cache list after v1 is complete
- Consider adding more pages to pre-cache based on usage analytics
- Potential for "download section for offline" feature if users want more control
