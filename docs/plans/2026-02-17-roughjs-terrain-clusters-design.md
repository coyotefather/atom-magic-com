# Rough.js Borders + Density-Based Terrain Clusters Design

## Goal

Two independent enhancements to the interactive world map: (A) hand-drawn region borders and rivers using Rough.js, and (B) replacing thousands of individual relief icons with ~30-40 pre-made cluster SVG graphics placed at terrain density hotspots.

## Feature A: Rough.js Region Borders + Rivers

### Problem

Region borders and rivers render as perfectly smooth computer-drawn lines. Tolkien's maps have imprecise, hand-drawn strokes.

### Approach

Install `roughjs` (~9KB). At runtime, convert SVG path `d` strings through `rough.path()` to produce sketchy strokes with configurable roughness and bowing.

**Region borders**: New `RoughBorders.tsx` component in its own SVGOverlay pane (z-index ~410). Imports `REGION_BOUNDARIES` GeoJSON from map-data.ts. Converts each polygon ring to an SVG path `d` string, then renders via Rough.js. The existing `RegionOverlay` keeps its invisible-stroke interactive polygons for hover/click — the rough borders are purely visual.

**Rivers**: Modify `RiversLayer.tsx` to pass each of the 33 river path `d` attributes through Rough.js instead of rendering plain `<path>` elements. Same SVGOverlay, roughened output.

**Coastline shadow**: Modify `CoastlineShadow.tsx` similarly — render the land outline through Rough.js for a hand-drawn coast.

### Rough.js Settings

- Region borders: `roughness: 0.8, strokeWidth: 1.5, bowing: 1, stroke: '#1a1a1a'`
- Rivers: `roughness: 0.5, strokeWidth: varies by river, bowing: 0.5, stroke: '#5d97bb'`
- Coastline: `roughness: 1.0, strokeWidth: 2.0, bowing: 1.2, stroke: '#1a1a1a'`

All values are starting points for tuning.

## Feature B: Density-Based Terrain Clusters

### Problem

6,680 individual relief icons either carpet the map (too many) or feel scattered after thinning. Tolkien draws a few purposeful terrain features — a mountain range here, a forest mass there — not thousands of dots.

### Approach

**Build-time density analysis** in `generate-tiles.mjs`:

1. Group placements by terrain type (mount, hill, conifer, deciduous, etc.)
2. Grid-bin into ~80x80 SVG-unit cells across the 1438x755 map (~18x9 grid)
3. For each type, find the densest cells
4. Merge adjacent high-density cells into cluster regions
5. Compute centroid, scale (based on placement count), and bounding box per cluster
6. Output to `src/lib/cluster-placements.ts`

**Cluster SVG artwork**: Static SVG strings defined in ReliefLayer.tsx as `CLUSTER_SVGS`. 2-3 variants per clusterable terrain type:

- Mountain range: ~3-5 peaked ridgeline with hatching, viewBox `0 0 100 50`
- Hill cluster: ~3-5 rounded bumps, viewBox `0 0 100 40`
- Conifer forest: ~5-8 pointed trees in a clump, viewBox `0 0 100 50`
- Deciduous forest: ~5-8 rounded canopy trees, viewBox `0 0 100 50`
- Acacia grove: ~3-5 flat-topped trees, viewBox `0 0 80 50`
- Palm grove: ~3-4 palms, viewBox `0 0 60 50`

These are simple placeholder SVGs. The system is designed so artwork can be swapped without changing any code.

**Rendering**: ReliefLayer renders cluster graphics as `<use>` elements positioned at computed centroids, scaled by cluster density. Each cluster picks a variant based on a deterministic hash for visual variety.

**Individual icons**: Sparse terrain types (grass, dune, swamp, vulcan, cactus, deadTree) keep thinned individual icons. Clusterable types that fall below the density threshold also remain as individuals.

### Target cluster counts

| Type | Source placements | Target clusters |
|------|------------------|----------------|
| mount/mountSnow | 113 | 3-4 |
| hill | 359 | 4-6 |
| conifer/coniferSnow | 1,058 | 5-8 |
| deciduous | 1,593 | 6-10 |
| acacia | 191 | 3-4 |
| palm | 62 | 2-3 |
| grass/dune/swamp/etc. | ~3,300 | Individual (thinned) |

## Architecture

### Files Modified/Created

| File | Action |
|------|--------|
| `package.json` | Add `roughjs` dependency |
| `src/app/components/map/RoughBorders.tsx` | **New** — Rough.js region border rendering |
| `src/app/components/map/RiversLayer.tsx` | Modify — render through Rough.js |
| `src/app/components/map/CoastlineShadow.tsx` | Modify — render through Rough.js |
| `src/app/components/map/SolumMap.tsx` | Add RoughBorders to layer stack |
| `scripts/generate-tiles.mjs` | Add density analysis + cluster output |
| `src/lib/cluster-placements.ts` | **New** (generated) — cluster positions/scales |
| `src/app/components/map/ReliefLayer.tsx` | Rewrite — render clusters + thinned individuals |

### Layer Stack

| Layer | Pane | z-index |
|-------|------|---------|
| Ocean contours | contourPane | 150 |
| Relief clusters + icons | reliefPane | 250 |
| Region overlay (interactive) | overlayPane | 400 |
| Rough borders (visual) | roughBorderPane | 410 |
| Rivers (rough) | riverPane | 420 |
| Spotlight mask | spotlightPane | 450 |
| Region labels | regionLabelsPane | 500 |
| Capital markers | capitalLabelsPane | 520 |

### Data Flow

```
.map file → generate-tiles.mjs → cluster-placements.ts (cluster positions)
                                → relief-data.ts (all placements, for individual fallback)
                                → map-data.ts (REGION_BOUNDARIES for rough borders)

cluster-placements.ts → ReliefLayer.tsx (cluster rendering)
relief-data.ts → ReliefLayer.tsx (individual icons for sparse types)
map-data.ts → RoughBorders.tsx (border paths)
river-data.ts → RiversLayer.tsx (river paths through Rough.js)
```

## Implementation Order

1. Install roughjs, create RoughBorders component
2. Modify RiversLayer for Rough.js
3. Modify CoastlineShadow for Rough.js
4. Add density analysis to build script
5. Create cluster SVG artwork + rewrite ReliefLayer
6. Tuning pass
