# Map Style Overhaul Design

**Goal:** Update the interactive Solum map to match a QGIS-rendered reference image — warm antique parchment palette, biome-colored land fills, denser relief icons blended to warm tone, solid brown contour lines, sage-green lakes, and a cartographic grid background.

**Reference image:** `mapfiles/solum-pr-qgis-12000 copy.png`

**Architecture:** Pure frontend changes — no build script modifications. New `BiomeFillLayer` component for biome-colored fills; CSS filter on `reliefPane` for icon tinting; style-only updates to OceanContours, LakesLayer, and SolumMap.css.

---

## Reference Image Style Analysis

### Color Palette
- **Ocean/background:** Warm khaki `#C4BB9A` with faint cartographic grid
- **Default land:** Sandy parchment `#D0C98A`
- **Forest (Taiga/Deciduous):** Muted olive `#9EA878`
- **Glacier/Snow (Boreas):** Near-white cream `#E4E0D0`
- **Terrae Mortuae:** Very dark warm brown `#3A2E10`
- **Wetland:** Gray-olive `#8E9870`
- **Lakes:** Muted sage blue-green `#8BA898`

### Key Visual Features
1. **Biome-colored fills** — each region filled by dominant biome, heavily desaturated and warm-shifted
2. **Solid warm brown contour lines** — no dash, graduated opacity/weight, warm `#6B5B3E`
3. **Dense relief icons** — trees ~65% density, warm parchment-brown tint via CSS filter
4. **Cartographic grid** — faint grid overlay on ocean (replaces horizontal hatching)
5. **Sage lake fill** — solid color, no hatch

---

## Component Design

### New: BiomeFillLayer.tsx

- **Pane:** `biomeFillPane`, z-index 145 (between coastlineShadowPane:140 and contourPane:150)
- **Data:** `REGION_BOUNDARIES` features × `REGION_BIOMES` × `BIOME_LEGEND`
- **Logic:**
  1. Build lookup: regionId → dominantBiome
  2. Map dominantBiome → warm antique fill color (table below)
  3. Detect Terrae Mortuae by low-luminance `MAP_REGIONS` color → override with `#3A2E10`
  4. Render filled SVG polygons, no stroke

**Biome color map:**
| Biome ID | Name | Fill Color |
|----------|------|------------|
| 11 | Glacier | `#E4E0D0` |
| 9 | Taiga | `#A0A87A` |
| 6 | Temperate deciduous forest | `#9EA878` |
| 8 | Temperate rain forest | `#9CA876` |
| 7 | Tropical rain forest | `#A0AA72` |
| 5 | Tropical seasonal forest | `#A8B07A` |
| 4 | Grassland | `#C4C490` |
| 3 | Savanna | `#C8C49A` |
| 2 | Cold desert | `#C8BA88` |
| 1 | Hot desert | `#D4C87A` |
| 10 | Tundra | `#C0B890` |
| 12 | Wetland | `#8E9870` |
| default | — | `#D0C98A` |

**Terrae Mortuae detection:** if `MAP_REGIONS` color for a region has hex luminance < 0.08 (i.e. very dark like `#4d4212`), fill with `#3A2E10`.

- Renders as SVGOverlay with `viewBox="0 0 1438 755"`, `preserveAspectRatio="none"`
- Uses same `ringToSvgPath` coordinate transform as CoastlineShadow: `x = coord[0] * 32`, `y = -coord[1] * 32`

---

### Modified: ReliefLayer.tsx

**KEEP_RATE changes:**
```typescript
const KEEP_RATE: Record<string, number> = {
  mount: 0.85,
  mountSnow: 0.85,
  hill: 0.65,       // was 0.55
  conifer: 0.65,    // was 0.22
  coniferSnow: 0.65, // was 0.25
  deciduous: 0.65,  // was 0.22
  grass: 0.55,      // was 0.18
  acacia: 0.65,     // was 0.28
  palm: 0.65,       // was 0.35
  dune: 0.55,       // was 0.45
  swamp: 0.55,      // was 0.45
  vulcan: 0.9,
  cactus: 0.45,     // was 0.35
  deadTree: 0.55,   // was 0.4
};
```

**Pane CSS filter:** After creating `reliefPane`, set:
```typescript
map.getPane('reliefPane')!.style.filter = 'sepia(0.5) brightness(0.82)';
```

---

### Modified: OceanContours.tsx

Replace dashed dark style with solid warm brown, graduated:
```typescript
const CONTOUR_STYLES: Record<number, L.PathOptions> = {
  1: { color: '#6B5B3E', weight: 1.2, opacity: 0.55 },
  2: { color: '#6B5B3E', weight: 1.0, opacity: 0.45 },
  3: { color: '#6B5B3E', weight: 0.9, opacity: 0.37 },
  4: { color: '#6B5B3E', weight: 0.8, opacity: 0.30 },
  5: { color: '#6B5B3E', weight: 0.7, opacity: 0.23 },
  6: { color: '#6B5B3E', weight: 0.6, opacity: 0.17 },
  7: { color: '#6B5B3E', weight: 0.5, opacity: 0.12 },
  8: { color: '#6B5B3E', weight: 0.4, opacity: 0.07 },
};
```
Remove `dashArray` from all levels.

---

### Modified: LakesLayer.tsx

Replace hatch pattern with solid sage fill:
- Remove `<pattern>` definition
- Fill: `#8BA898`, stroke: `#5A7A6E`, strokeWidth: `0.8`, opacity: `0.85`

---

### Modified: SolumMap.css

**Ocean background:**
```css
.solum-map {
  background-color: #C4BB9A;
  background-image:
    linear-gradient(rgba(0,0,0,0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,0,0,0.07) 1px, transparent 1px);
  background-size: 48px 48px;
}
```

---

### Modified: SolumMap.tsx

Add `<BiomeFillLayer />` between `<CoastlineShadow />` and `<OceanContours />`.

---

## Layer Stack (z-index)

| Layer | Pane | z-index |
|-------|------|---------|
| CoastlineShadow (land fill + shadow) | coastlineShadowPane | 140 |
| BiomeFillLayer (biome colors) | biomeFillPane | 145 |
| OceanContours | contourPane | 150 |
| Lakes | lakePane | 200 |
| ReliefLayer | reliefPane | 250 |
| RegionOverlay (interactive) | overlayPane | 400 |
| RoughBorders | roughBordersPane | 410 |
| RegionShadows | regionShadowPane | 395 |
| Rivers | riverPane | 420 |
| Spotlight mask | spotlightPane | 450 |
| Labels + capitals | markerPane | 600 |

---

## Files Changed

| File | Action |
|------|--------|
| `src/app/components/map/BiomeFillLayer.tsx` | **New** |
| `src/app/components/map/SolumMap.tsx` | Add `<BiomeFillLayer />` |
| `src/app/components/map/ReliefLayer.tsx` | KEEP_RATE + pane filter |
| `src/app/components/map/OceanContours.tsx` | Solid warm brown contours |
| `src/app/components/map/LakesLayer.tsx` | Solid sage fill |
| `src/app/components/map/SolumMap.css` | Ocean bg + grid pattern |
