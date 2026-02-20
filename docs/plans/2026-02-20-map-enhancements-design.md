# Map Enhancements Design

**Goal:** Further close the gap between the interactive Solum map and the QGIS reference image by adding true biome geometry, fixed ocean contour rings, paper grain, a cartographic grid over land, a compass rose/title block, and auto-generated pencil annotations.

**Reference image:** `mapfiles/solum-pr-qgis-12000 copy.png`

**Architecture:** Two build-script changes regenerate `map-data.ts` and new `biome-data.ts`; five new/modified frontend components handle rendering. No new npm dependencies beyond what's already installed (Rough.js already in use).

---

## Section 1: Build Script Changes

### True biome geometry (`extractBiomeGeometry()`)

Azgaar pre-renders biome shapes as SVG paths in `<g id="biomes">` within the SVG line. Extract those paths directly (same technique used for rivers/terrain in `extractRivers()` and `extractRelief()`). For each `<path>`, capture the `d` attribute and `fill` color. Map each Azgaar fill color → warm antique palette color. Write to `src/lib/biome-data.ts`.

**Azgaar biome color → warm antique color map:**
| Azgaar color | Biome | Warm color |
|---|---|---|
| `#53679f` | Marine | `transparent` |
| `#fbe79f` | Hot desert | `#D4C87A` |
| `#b5b887` | Cold desert | `#C8BA88` |
| `#d2d082` | Savanna | `#C8C49A` |
| `#c8d68f` | Grassland | `#C4C490` |
| `#b6d95d` | Tropical seasonal forest | `#A8B07A` |
| `#29bc56` | Temperate deciduous forest | `#9EA878` |
| `#7dcb35` | Tropical rain forest | `#A0AA72` |
| `#45b348` | Temperate rain forest | `#9CA876` |
| `#4b6b32` | Taiga | `#A0A87A` |
| `#96784b` | Tundra | `#C0B890` |
| `#d5e7eb` | Glacier | `#E4E0D0` |
| `#0b9131` | Wetland | `#8E9870` |
| default | — | `#D0C98A` |

Terrae Mortuae override: any region whose `MAP_REGIONS` name includes "Terrae Mortuae" gets fill `#3A2E10`. This override is applied in `BiomeFillLayer.tsx` at render time — the biome data itself just carries Azgaar colors mapped to warm tones.

`BiomeFillLayer.tsx` updated to import `BIOME_PATHS` from `biome-data.ts` and render them via `SVGOverlay` with `viewBox="0 0 1438 755" preserveAspectRatio="none"`. No coordinate transform needed — Azgaar SVG paths are already in this coordinate space.

### Fixed ocean contours (`generateOceanContours()`)

**Bug:** Current implementation offsets each individual region polygon ring, including internal political borders between adjacent regions on the same landmass.

**Fix:** Extract `<g id="coastline">` paths from the SVG line (Azgaar pre-computes the unified landmass boundary here). Parse those paths using the existing `parseSvgPath()` helper. Offset outward at 12 distances.

**New offsets (12 levels, tighter inner spacing):**
```javascript
const OFFSETS = [0.02, 0.05, 0.09, 0.14, 0.20, 0.27, 0.35, 0.44, 0.54, 0.65, 0.77, 0.90];
```

`OceanContours.tsx` updated to handle depth levels 1–12.

**After build script changes:** Re-run:
```bash
node scripts/generate-tiles.mjs mapfiles/SOLUM-PR.map
```

---

## Section 2: New Visual Overlay Layers

### `GrainOverlay.tsx`
- **Pane:** `grainPane`, z-index 170
- Full-map SVGOverlay with `viewBox="0 0 1438 755" preserveAspectRatio="none"`
- Renders a `<rect width="1438" height="755">` with SVG filter:
  ```svg
  <filter id="paper-grain">
    <feTurbulence type="fractalNoise" baseFrequency="0.9 0.9" numOctaves="4" seed="2" result="noise" />
    <feColorMatrix type="matrix"
      values="0 0 0 0 0.4  0 0 0 0 0.35  0 0 0 0 0.25  0 0 0 0.10 0"
      in="noise" />
  </filter>
  ```
- Warm brownish grain at ~10% opacity over the whole map

### `GridLayer.tsx`
- **Pane:** `gridPane`, z-index 160
- Full-map SVGOverlay with same viewBox
- SVG `<pattern id="map-grid" width="48" height="48" patternUnits="userSpaceOnUse">` with two perpendicular lines at `rgba(0,0,0,0.06)`, strokeWidth `0.5`
- `<rect width="1438" height="755" fill="url(#map-grid)" />`
- Extends the cartographic grid over land (currently grid only shows in ocean CSS background)

Both added to `SolumMap.tsx` between `<OceanContours />` and `<LakesLayer />`.

---

## Section 3: Compass Rose + Title Block

**Component:** `MapCompass.tsx`

**Placement:** Absolutely positioned `div` inside `SolumMap.tsx`'s outer `<div className="relative">`, outside `<MapContainer>`. Top-left corner, does not move with pan/zoom.

**Content:**
- Inline SVG 8-pointed compass star (~48×48px), sepia `#6B5B3E`
  - 4 cardinal points (N larger), 4 intercardinal points
  - "N" text label above north point
- Map title: "SOLUM" — Marcellus font, ~16px, letter-spacing wide, dark sepia
- Subtitle: "350 POST RUINAM" — smaller, lighter weight

**Styling:** Semi-transparent parchment background (`rgba(245, 240, 225, 0.7)`), subtle border, padding. Matches the top-left block in the reference image.

---

## Section 4: Pencil Annotation Layer

**Component:** `AnnotationLayer.tsx`

- **Pane:** `annotationPane`, z-index 445 (above rivers:420, below spotlightPane:450)
- SVGOverlay, same bounds/viewBox as other overlays
- Renders via Rough.js (already installed — used by `CoastlineShadow.tsx`)

**Auto-generated marks (from `MAP_CAPITALS` data):**

1. **Route line** — Rough.js `linearPath()` through all capital positions in order, converting CRS.Simple → SVG coords (`x = lng * 32`, `y = -lat * 32`). Style: pencil-gray `#8A7A6A`, roughness `1.2`, stroke width `1.0`, `lineDash: [6, 4]`.

2. **Warning circles** — For each region whose name includes "Terrae Mortuae", compute centroid from `REGION_BOUNDARIES` polygon bounds. Draw Rough.js `circle()` at that centroid, radius ~15px. Style: same pencil-gray, roughness `1.5`.

3. **"Unexplored?" text** — Static SVG `<text>` element near right edge of map (x≈1350, y≈200), font-style italic, fill `#8A7A6A`, opacity `0.5`, font-size `10`.

**Toggle:**
- Small button (pencil icon `mdiPencil` from `@mdi/js`) in the map's bottom-left corner, as a fixed overlay
- State in `localStorage`: key `atom-magic-map-annotations-visible`, default `'true'`
- When `'false'`: `AnnotationLayer` returns `null`
- Button toggles between filled/outline pencil icon to indicate state

---

## Layer Stack (updated)

| Layer | Pane | z-index |
|---|---|---|
| CoastlineShadow | coastlineShadowPane | 140 |
| BiomeFillLayer | biomeFillPane | 145 |
| OceanContours | contourPane | 150 |
| GridLayer | gridPane | 160 |
| GrainOverlay | grainPane | 170 |
| LakesLayer | lakePane | 200 |
| ReliefLayer | reliefPane | 250 |
| RegionOverlay | overlayPane | 400 |
| RoughBorders | roughBordersPane | 410 |
| RegionShadows | regionShadowPane | 395 |
| RiversLayer | riverPane | 420 |
| AnnotationLayer | annotationPane | 445 |
| SpotlightMask | spotlightPane | 450 |
| Labels + Capitals | markerPane | 600 |

---

## Files Changed

| File | Action |
|---|---|
| `scripts/generate-tiles.mjs` | Add `extractBiomeGeometry()`, fix `generateOceanContours()` to use coastline |
| `src/lib/biome-data.ts` | **New** — generated biome SVG paths |
| `src/lib/map-data.ts` | Regenerated — 12-level ocean contours |
| `src/app/components/map/BiomeFillLayer.tsx` | Update to use `BIOME_PATHS` from `biome-data.ts` |
| `src/app/components/map/OceanContours.tsx` | Update styles for 12 depth levels |
| `src/app/components/map/GrainOverlay.tsx` | **New** |
| `src/app/components/map/GridLayer.tsx` | **New** |
| `src/app/components/map/MapCompass.tsx` | **New** |
| `src/app/components/map/AnnotationLayer.tsx` | **New** |
| `src/app/components/map/SolumMap.tsx` | Wire all new components |
