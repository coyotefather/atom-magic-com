# Map Label & City Polish — Design

## Overview

Six incremental polish changes to the Solum interactive map.

---

## 1. Biome Fill Opacity → 50%

`BiomeFillLayer.tsx`: add `fillOpacity={0.5}` to each `<path>`. Dead-land fill stays distinct (dark `#3A2E10`).

---

## 2. Terrae Mortuae Tree Override

Regions `state-4` (Western) and `state-5` (Eastern) should render dead-tree icons instead of any live tree icons.

**Approach:** In `ReliefLayer.tsx`, precompute SVG-space polygon rings for the two TM regions by filtering `REGION_BOUNDARIES` on `regionId`. For each visible placement whose `customType` is `tree-a/b/c/d`, run a ray-casting point-in-polygon check against the TM rings. Override `customType` to `tree-e` if inside. Hills and grass are unchanged.

---

## 3. Remove Stroke from Labels

`RegionLabels.tsx` — remove `stroke`, `strokeWidth`, `strokeLinejoin`, `paintOrder`.
`CapitalMarkers.tsx` — same; also add `textTransform: uppercase` to match region labels.

Region labels already have `style={{ textTransform: 'uppercase' }}`.

---

## 4. Remove Rotation from Region Labels

Drop the `transform` attribute from `RegionLabels.tsx`. Angles are retained in `LABEL_OVERRIDES` / `LABEL_CONFIGS` (still used for relief clearance zones) but not applied visually.

---

## 5. Multi-Word Labels → One Word Per Row

`RegionLabels.tsx`: split `label.name` on spaces. Render each word as an SVG `<tspan x={svgX} dy={lineHeight}>`. Offset the parent `<text y>` upward by `(wordCount - 1) * lineHeight / 2` so the block stays vertically centred. Single-word labels render unchanged.

`lineHeight = fontSize * 1.25` (e.g. 11.25 for the default fontSize=9).

---

## 6. All City Labels

### Data extraction

Add `extractCities()` to `generate-tiles.mjs`. Extracts all non-removed burgs (name, x, y, stateId, capital flag). Burg coordinates are already in SVG pixel space (0–1438, 0–755). Adds `MapCity` interface and `MAP_CITIES` export to `map-data.ts`.

### New `CityLabels.tsx` component

Replaces `CapitalMarkers.tsx`. Uses `useMap` + zoom-change events to track current zoom.

| Layer | Visible at | Dot | Font |
|-------|-----------|-----|------|
| Capitals (15) | All zooms | r=1.5, `#1a1a1a` | Noto Serif italic 5, uppercase |
| Non-capitals (379) | Max zoom only (zoom 5) | r=0.8, `#1a1a1a` | Noto Serif italic 3, uppercase |

Both layers in the same SVG pane (`capitalLabelsPane`, z=520).

### Clearance zones

City clearance zones in `label-config.ts` remain capitals-only (adding 379 zones would be excessive and may incorrectly suppress relief icons near legitimate terrain).

---

## Files Changed

| File | Change |
|------|--------|
| `BiomeFillLayer.tsx` | `fillOpacity={0.5}` |
| `ReliefLayer.tsx` | TM point-in-polygon override |
| `RegionLabels.tsx` | No stroke, no rotation, word-per-row tspan |
| `CapitalMarkers.tsx` → `CityLabels.tsx` | All cities, zoom-gated non-capitals |
| `scripts/generate-tiles.mjs` | `extractCities()`, passes to `writeMapData` |
| `src/lib/map-data.ts` | `MapCity` interface, `MAP_CITIES` export |
| `src/app/components/map/SolumMap.tsx` | Swap `CapitalMarkers` → `CityLabels` |
