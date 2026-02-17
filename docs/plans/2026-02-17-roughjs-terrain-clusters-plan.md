# Rough.js Borders + Density-Based Terrain Clusters Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add hand-drawn Rough.js rendering to region borders, coastline, and rivers; replace individual relief icons with density-based cluster graphics for clusterable terrain types.

**Architecture:** Rough.js runs at runtime in SVGOverlay components, converting SVG path `d` strings into sketchy strokes. Terrain density analysis happens at build time in generate-tiles.mjs, outputting cluster placement data. ReliefLayer renders pre-made cluster SVG artwork at hotspot positions, with sparse types keeping thinned individual icons.

**Tech Stack:** roughjs (npm), react-leaflet SVGOverlay, Node.js build script

---

## Task 1: Install roughjs and create RoughBorders component

**Files:**
- Modify: `package.json`
- Create: `src/app/components/map/RoughBorders.tsx`
- Modify: `src/app/components/map/SolumMap.tsx`

**Step 1: Install roughjs**

```bash
npm install roughjs
```

**Step 2: Create RoughBorders.tsx**

This component renders region boundary polygons through Rough.js in its own SVGOverlay pane (z-index 410, above RegionOverlay at 400 but below rivers at 420).

Key details:
- Import `REGION_BOUNDARIES` from `@/lib/map-data` — a GeoJSON FeatureCollection with Polygon/MultiPolygon features
- Import `MAP_CONFIG` for bounds and SVG dimensions
- Each feature has `properties.regionId`
- GeoJSON coordinates are in Leaflet CRS.Simple space: `[lng, lat]` pairs
- Convert to SVG coordinates: `svgX = lng * 32`, `svgY = -lat * 32` (DIVISOR = 32, Y is inverted)
- Convert polygon rings to SVG path `d` strings, then pass through `rough.path(d, options)`
- Use `useRef` to get a ref to the SVG element, then call `rough.svg(svgEl)` to create the rough SVG generator
- Render rough paths by appending Rough.js-generated SVG elements to a ref'd `<g>` via `useEffect`
- Rough.js settings: `{ roughness: 0.8, strokeWidth: 1.5, bowing: 1, stroke: '#1a1a1a', fill: 'none' }`

Helper to convert a GeoJSON coordinate ring to SVG path `d`:

```typescript
function ringToSvgPath(ring: number[][]): string {
  return ring.map((coord, i) => {
    const x = coord[0] * 32;
    const y = -coord[1] * 32;
    return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
  }).join(' ') + ' Z';
}
```

Note: Rough.js `rough.svg(svgEl).path(d, opts)` returns an SVG `<g>` element. Append it to a ref'd `<g>` element via `useEffect` to avoid innerHTML.

**Step 3: Add RoughBorders to SolumMap.tsx**

Import and add between `RegionOverlay` and `RegionShadows`:

```tsx
import RoughBorders from './RoughBorders';
// ...
<RegionOverlay onRegionFocus={handleRegionFocus} />
<RoughBorders />
<RegionShadows />
```

**Step 4: Build and verify**

```bash
npx next build --webpack
```

**Step 5: Commit**

```bash
git add package.json package-lock.json src/app/components/map/RoughBorders.tsx src/app/components/map/SolumMap.tsx
git commit -m "Add Rough.js hand-drawn region borders"
```

---

## Task 2: Add Rough.js rendering to RiversLayer

**Files:**
- Modify: `src/app/components/map/RiversLayer.tsx`

**Step 1: Modify RiversLayer to use Rough.js**

Current state: renders 33 `<path>` elements with `fill="#1a1a1a"` and `stroke="none"`. Each river has `{ id, d, width }`.

New approach:
- Import `rough` from `roughjs`
- Use a `useRef<SVGSVGElement>` on the `<svg>` element
- In a `useEffect`, clear the ref'd group, then for each river path call `rough.svg(svgRef.current).path(river.d, opts)` and append the result
- Since Azgaar river paths use `fill` not `stroke` (they're closed shapes), render with `{ fill: '#1a1a1a', fillStyle: 'solid', stroke: 'none', roughness: 0.3 }`. Test and adjust — if the filled rough look is too noisy, try `{ fill: 'none', stroke: '#1a1a1a', strokeWidth: 1.0, roughness: 0.5, bowing: 0.5 }` instead.

Note: The rivers are Bezier curves (`C` commands in the `d` attribute). Rough.js handles these natively.

**Step 2: Build and verify**

```bash
npx next build --webpack
```

**Step 3: Commit**

```bash
git add src/app/components/map/RiversLayer.tsx
git commit -m "Render rivers through Rough.js for hand-drawn appearance"
```

---

## Task 3: Add Rough.js rendering to CoastlineShadow

**Files:**
- Modify: `src/app/components/map/CoastlineShadow.tsx`

**Step 1: Convert CoastlineShadow from GeoJSON to SVGOverlay with Rough.js**

Current state: uses react-leaflet `<GeoJSON>` with `fillColor: '#F5F3ED'`, `color: '#1a1a1a'`, `weight: 2.5`. Has a drop-shadow CSS filter on its pane (z-index 140).

New approach:
- Switch from `<GeoJSON>` to `<SVGOverlay>` (same pattern as RoughBorders)
- Import `REGION_BOUNDARIES` and convert polygon rings to SVG path `d` strings using the same `ringToSvgPath` helper
- Render through Rough.js with: `{ roughness: 1.0, strokeWidth: 2.5, bowing: 1.2, stroke: '#1a1a1a', fill: '#F5F3ED', fillStyle: 'solid' }`
- Keep the existing drop-shadow CSS filter on the pane
- Keep z-index 140

Note: Both RoughBorders and CoastlineShadow render the same REGION_BOUNDARIES polygons. The `ringToSvgPath` helper is small (5 lines) — duplicating in each component is fine.

**Step 2: Build and verify**

```bash
npx next build --webpack
```

**Step 3: Commit**

```bash
git add src/app/components/map/CoastlineShadow.tsx
git commit -m "Render coastline through Rough.js for hand-drawn appearance"
```

---

## Task 4: Add density analysis to build script

**Files:**
- Modify: `scripts/generate-tiles.mjs`

**Step 1: Add density analysis functions**

Add `computeTerrainClusters(relief)` after `extractRelief()`. This function:

1. Groups 6,680 placements by terrain type
2. Grid-bins into 80x80 SVG-unit cells (~18x10 grid)
3. Computes per-type density threshold as `max(3, mean + 0.5 * stddev)` of non-zero cell counts
4. Flood-fills adjacent high-density cells into cluster regions
5. Computes weighted centroid and total count per cluster
6. Normalizes scale per type (largest = 1.0, smallest = 0.4)

Clusterable types: `mount`, `mountSnow`, `hill`, `conifer`, `coniferSnow`, `deciduous`, `acacia`, `palm`.

Individual types (not clustered): `grass`, `dune`, `swamp`, `vulcan`, `cactus`, `deadTree`.

**Step 2: Add writeClusterData function**

Writes `src/lib/cluster-placements.ts` with:
- `TerrainCluster` interface: `{ type, cx, cy, count, scale }`
- `TERRAIN_CLUSTERS` exported array

**Step 3: Wire into main()**

After `const relief = extractRelief(mapData);`:
```javascript
const clusters = computeTerrainClusters(relief);
```
And add `writeClusterData(clusters)` alongside other write calls.

**Step 4: Run build script and verify output**

```bash
node scripts/generate-tiles.mjs mapfiles/SOLUM-PR.map
```

Check that `src/lib/cluster-placements.ts` is generated with ~20-40 clusters, positions within 0-1438 / 0-755.

**Step 5: Commit**

```bash
git add scripts/generate-tiles.mjs src/lib/cluster-placements.ts
git commit -m "Add terrain density analysis and cluster placement generation"
```

---

## Task 5: Create cluster SVG artwork and rewrite ReliefLayer

**Files:**
- Modify: `src/app/components/map/ReliefLayer.tsx`

**Step 1: Define cluster SVG artwork**

Add `CLUSTER_SVGS` constant — 2-3 variants per clusterable type. Each uses viewBox `0 0 100 60` and contains a hand-drawn scene (multiple icons composed together). All content is black ink, stroke-only, matching the existing Tolkien style.

Types to create cluster artwork for:
- `mount` / `mountSnow`: Mountain range — 3-5 connected peaks with hatching
- `hill`: Rolling hills — 3-4 rounded bumps with light hatching
- `conifer` / `coniferSnow`: Pine forest — 5-7 pointed trees in a clump
- `deciduous`: Deciduous forest — 5-7 rounded canopy trees
- `acacia`: Acacia grove — 3-4 flat-topped trees
- `palm`: Palm grove — 3-4 palms

Each variant should look slightly different (different peak heights, tree spacing, etc.) for organic variety. Keep stroke weights light (0.8-1.2) to match existing individual icons.

**Step 2: Rewrite ReliefLayer to render clusters + individuals**

- Import `TERRAIN_CLUSTERS` from `@/lib/cluster-placements`
- Define cluster `<symbol>` elements in `<defs>` (e.g., `id="cluster-mount-0"`, `id="cluster-mount-1"`, etc.)
- Render each cluster as a `<use>` element positioned at `(cx - w/2, cy - h/2)` where `w = 100 * scale`, `h = 60 * scale`
- Pick variant with `Math.floor(posHash(cx, cy) * variantCount)`
- Keep thinned individual icons ONLY for non-clustered types (grass, dune, swamp, vulcan, cactus, deadTree)
- Remove individual icons for clustered types (they're replaced by the cluster graphics)
- Keep the clearance zone filtering for individual icons
- Keep the existing `TOLKIEN_CONTENT` individual icon definitions for the non-clustered types

**Step 3: Build and verify**

```bash
npx next build --webpack
```

**Step 4: Commit**

```bash
git add src/app/components/map/ReliefLayer.tsx
git commit -m "Replace individual relief icons with density-based cluster graphics"
```

---

## Task 6: Tuning pass

**Files:**
- Possibly modify: `RoughBorders.tsx`, `RiversLayer.tsx`, `CoastlineShadow.tsx`, `ReliefLayer.tsx`
- Possibly modify: `scripts/generate-tiles.mjs` (cluster thresholds)

**Step 1: Visual review and adjust**

Run `npm run dev`, navigate to `/map`, and review:

- Rough.js border roughness — too much? too little? Adjust `roughness`, `bowing`, `strokeWidth`
- River rendering — do the rough rivers look right? Adjust settings
- Coastline — does the rough coastline work with the drop-shadow? May need to tweak
- Cluster placement — are clusters in the right spots? Adjust `CELL_SIZE` or threshold in build script
- Cluster scale — too big/small? Adjust the base viewBox dimensions or scale range
- Individual icon density for sparse types — still appropriate?

**Step 2: Rebuild if build script changed**

```bash
node scripts/generate-tiles.mjs mapfiles/SOLUM-PR.map
```

**Step 3: Final build verification**

```bash
npx next build --webpack
```

**Step 4: Commit tuning changes**

```bash
git add -A
git commit -m "Tune Rough.js settings and terrain cluster placement"
```
