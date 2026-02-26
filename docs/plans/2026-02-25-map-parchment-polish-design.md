# Map Parchment Polish Design

**Date:** 2026-02-25

## Goal

Make the map look like everything is drawn on the same piece of parchment, matching the reference hand-drawn map. Six changes: unified parchment palette, bolder/wider contour lines, automatic label deconfliction, relief clearance extended to cities, city labels non-italic, RoughJS on lakes + slightly stronger borders.

---

## 1. Parchment Base Color

- Ocean background (`SolumMap.css`): `#BACDD8` → `#EAE4D0`
- Land fill opacity (`BiomeFillLayer.tsx`): 0.5 → 0.3; all fill colors shifted closer to parchment
- CoastlineShadow fill: `#F5F3ED` → `#EDE8D5`
- Lakes fill: `#8BA898` → `#C8CFCA`, stroke lightened

## 2. Ocean Contours — Bolder, Wider Spaced

- New OFFSETS (exponential): `[0.03, 0.07, 0.13, 0.22, 0.38, 0.62, 1.00, 1.55, 2.30, 3.25, 4.40, 5.80]`
- Inner lines much bolder (depth 1: weight 2.0 opacity 0.75) fading to outer (depth 12: weight 0.4 opacity 0.05)
- Rebuild map data after script change

## 3. Automatic Label Deconfliction

- `label-config.ts`: add `deconflictLabels()` after `computeLabelConfigs()`
- Sort by fontSize descending (larger labels stay put)
- Estimate AABB per label from multi-line layout (max word length × char width, line count × line height)
- Greedy pass: nudge `svgY` first, fallback `svgX`, until clear of all already-placed labels
- Relief clearance zones inherit updated positions automatically

## 4. Relief Clearance Extended to Cities

- `computeClearanceZones` in `label-config.ts`: add non-capital city zones from `MAP_CITIES`
- Small zones based on fontSize 3 approximation

## 5. City Labels Non-Italic

- `CityLabels.tsx`: remove `fontStyle="italic"` from both capitals and non-capitals

## 6. RoughJS Scope

- **Lakes**: switch `LakesLayer.tsx` to RoughJS outline (roughness ~0.3, thin stroke)
- **Borders**: increase roughness 0.35 → 0.5, bowing 0.4 → 0.6
- Rivers: unchanged (Azgaar Bézier fills already organic)
- Contours: unchanged (cartographic lines stay smooth)
