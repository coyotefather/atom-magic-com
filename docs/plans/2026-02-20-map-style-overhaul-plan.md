# Map Style Overhaul Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Update the interactive Solum map to match a QGIS-rendered reference image with biome-colored land fills, warm antique contours, dense warm-tinted relief icons, solid sage lakes, and a cartographic grid background.

**Architecture:** Pure frontend changes — no build script modifications. New `BiomeFillLayer` component provides biome-colored fills using existing `REGION_BIOMES` data. CSS filter on `reliefPane` tints all relief icons warm. Style-only updates to OceanContours, LakesLayer, and SolumMap.css.

**Tech Stack:** React, TypeScript, react-leaflet SVGOverlay, Leaflet panes, CSS filters.

**Design doc:** `docs/plans/2026-02-20-map-style-overhaul-design.md`

**No unit tests** — these are visual rendering changes. Verification is: `npm run build` (TypeScript must pass) + visual check in `npm run dev` at `/map`.

---

## Key context

### Coordinate transform (used in SVG overlays)
GeoJSON coordinates in this map use CRS.Simple space. To convert to SVG pixel space:
```typescript
x = coord[0] * 32   // longitude → SVG x
y = -coord[1] * 32  // latitude → SVG y (flipped)
```
This is the same transform used in `CoastlineShadow.tsx`.

### Layer z-index stack
```
coastlineShadowPane  140  (flat land fill + drop-shadow)
biomeFillPane        145  (NEW — biome colors)
contourPane          150  (ocean contour lines)
lakePane             200  (lakes)
reliefPane           250  (terrain icons)
overlayPane          400  (interactive region polygons)
```

### Data available in `src/lib/map-data.ts`
- `REGION_BOUNDARIES` — GeoJSON FeatureCollection; each feature has `properties.regionId`
- `REGION_BIOMES` — array of `{ regionId, dominantBiome, biomes[] }` (dominantBiome is a biome ID number)
- `MAP_REGIONS` — array of `{ id, name, color }` (name includes "Terrae Mortuae" for dead land regions)
- `MAP_CONFIG.BOUNDS_SW / BOUNDS_NE / SVG_WIDTH / SVG_HEIGHT`

---

## Task 1: BiomeFillLayer component

**Files:**
- Create: `src/app/components/map/BiomeFillLayer.tsx`

### Step 1: Create the file

```tsx
'use client';

import { useState, useEffect } from 'react';
import { SVGOverlay, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MAP_CONFIG, REGION_BOUNDARIES, REGION_BIOMES, MAP_REGIONS } from '@/lib/map-data';

// Warm antique fill colours per Azgaar biome ID
const BIOME_FILL_COLORS: Record<number, string> = {
	11: '#E4E0D0', // Glacier — near-white cream (Boreas)
	9:  '#A0A87A', // Taiga — muted olive
	6:  '#9EA878', // Temperate deciduous forest — olive green
	8:  '#9CA876', // Temperate rain forest — medium olive
	7:  '#A0AA72', // Tropical rain forest — deeper olive
	5:  '#A8B07A', // Tropical seasonal forest — lighter olive
	4:  '#C4C490', // Grassland — warm tan-green
	3:  '#C8C49A', // Savanna — warm tan
	2:  '#C8BA88', // Cold desert — sandy
	1:  '#D4C87A', // Hot desert — warm yellow-sand
	10: '#C0B890', // Tundra — warm tan
	12: '#8E9870', // Wetland — gray-olive
};

const DEFAULT_FILL = '#D0C98A';
const DEAD_LAND_FILL = '#3A2E10';

// Build lookups once at module load
const regionBiomeMap = new Map(REGION_BIOMES.map((b) => [b.regionId, b.dominantBiome]));
const regionNameMap = new Map(MAP_REGIONS.map((r) => [r.id, r.name]));

function getRegionFill(regionId: string): string {
	const name = regionNameMap.get(regionId) ?? '';
	if (name.includes('Terrae Mortuae')) return DEAD_LAND_FILL;
	const biomeId = regionBiomeMap.get(regionId);
	if (biomeId === undefined) return DEFAULT_FILL;
	return BIOME_FILL_COLORS[biomeId] ?? DEFAULT_FILL;
}

function ringToSvgPath(ring: number[][]): string {
	return (
		ring
			.map((coord, i) => {
				const x = coord[0] * 32;
				const y = -coord[1] * 32;
				return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
			})
			.join(' ') + ' Z'
	);
}

const BiomeFillLayer = () => {
	const map = useMap();
	const [paneReady, setPaneReady] = useState(false);

	useEffect(() => {
		if (!map.getPane('biomeFillPane')) {
			map.createPane('biomeFillPane');
		}
		map.getPane('biomeFillPane')!.style.zIndex = '145';
		setPaneReady(true);
	}, [map]);

	if (!paneReady) return null;

	const bounds = L.latLngBounds(
		L.latLng(MAP_CONFIG.BOUNDS_SW[0], MAP_CONFIG.BOUNDS_SW[1]),
		L.latLng(MAP_CONFIG.BOUNDS_NE[0], MAP_CONFIG.BOUNDS_NE[1])
	);

	return (
		<SVGOverlay bounds={bounds} pane="biomeFillPane" interactive={false}>
			<svg
				viewBox={`0 0 ${MAP_CONFIG.SVG_WIDTH} ${MAP_CONFIG.SVG_HEIGHT}`}
				preserveAspectRatio="none"
			>
				{REGION_BOUNDARIES.features.map((feature, i) => {
					const regionId = feature.properties?.regionId as string | undefined;
					const fill = regionId ? getRegionFill(regionId) : DEFAULT_FILL;
					const geom = feature.geometry;

					if (geom.type === 'Polygon') {
						const d = ringToSvgPath(geom.coordinates[0] as number[][]);
						return <path key={i} d={d} fill={fill} stroke="none" />;
					}
					if (geom.type === 'MultiPolygon') {
						const d = (geom.coordinates as number[][][][])
							.map((poly) => ringToSvgPath(poly[0]))
							.join(' ');
						return <path key={i} d={d} fill={fill} stroke="none" />;
					}
					return null;
				})}
			</svg>
		</SVGOverlay>
	);
};

export default BiomeFillLayer;
```

### Step 2: Verify TypeScript

```bash
npm run build -- --webpack 2>&1 | grep -E "error|BiomeFill"
```

Expected: no TypeScript errors mentioning BiomeFillLayer.

### Step 3: Commit

```bash
git add src/app/components/map/BiomeFillLayer.tsx
git commit -m "feat(map): add BiomeFillLayer with warm antique biome colours"
```

---

## Task 2: Wire BiomeFillLayer into SolumMap

**Files:**
- Modify: `src/app/components/map/SolumMap.tsx`

### Step 1: Add import

At line 13 (after the existing CoastlineShadow import), add:
```typescript
import BiomeFillLayer from './BiomeFillLayer';
```

### Step 2: Add component to JSX

In the `<MapContainer>` JSX, insert `<BiomeFillLayer />` immediately after `<CoastlineShadow />`:

```tsx
<CoastlineShadow />
<BiomeFillLayer />
<OceanContours />
```

### Step 3: Verify builds and renders

```bash
npm run build -- --webpack 2>&1 | tail -5
```

Expected: `✓ Compiled successfully` (or equivalent — no errors).

Then start dev server and open `/map`. You should see distinct biome-coloured fills on land areas:
- Boreas (north) near-white
- Forest areas olive-green
- Terrae Mortuae very dark brown
- Most land sandy parchment

### Step 4: Commit

```bash
git add src/app/components/map/SolumMap.tsx
git commit -m "feat(map): wire BiomeFillLayer into SolumMap"
```

---

## Task 3: Relief icons — increase density + warm tint

**Files:**
- Modify: `src/app/components/map/ReliefLayer.tsx`

### Step 1: Update KEEP_RATE constants

Replace the existing `KEEP_RATE` object (lines 16–31) with:

```typescript
const KEEP_RATE: Record<string, number> = {
	mount: 0.85,
	mountSnow: 0.85,
	hill: 0.65,
	conifer: 0.65,
	coniferSnow: 0.65,
	deciduous: 0.65,
	grass: 0.55,
	acacia: 0.65,
	palm: 0.65,
	dune: 0.55,
	swamp: 0.55,
	vulcan: 0.9,
	cactus: 0.45,
	deadTree: 0.55,
};
```

### Step 2: Add CSS filter to reliefPane

Replace the existing `useEffect` that creates the pane:

```typescript
useEffect(() => {
	if (!map.getPane('reliefPane')) {
		map.createPane('reliefPane');
	}
	const pane = map.getPane('reliefPane')!;
	pane.style.zIndex = '250';
	pane.style.filter = 'sepia(0.5) brightness(0.82)';
	setPaneReady(true);
}, [map]);
```

### Step 3: Verify

```bash
npm run build -- --webpack 2>&1 | tail -5
```

In the browser at `/map`, relief icons should now be denser and tinted warm brown/olive — matching the reference image's unified parchment tone rather than Azgaar's vivid greens.

### Step 4: Commit

```bash
git add src/app/components/map/ReliefLayer.tsx
git commit -m "feat(map): increase relief icon density and add warm sepia tint"
```

---

## Task 4: Ocean contours — solid warm brown

**Files:**
- Modify: `src/app/components/map/OceanContours.tsx`

### Step 1: Replace CONTOUR_STYLES

Replace the existing `CONTOUR_STYLES` object (lines 8–17) with:

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

Note: no `dashArray` on any level — solid lines only.

### Step 2: Remove dashArray from style function

In the `style` callback inside the `<GeoJSON>` component, the spread of `baseStyle` already handles this since the new styles have no `dashArray`. But confirm the final returned object does NOT add `dashArray` anywhere. The full style return should be:

```typescript
return {
	...baseStyle,
	fill: false,
	interactive: false,
};
```

### Step 3: Verify

```bash
npm run build -- --webpack 2>&1 | tail -5
```

In the browser: contour rings around coastlines should be solid warm brown, not dashed dark grey.

### Step 4: Commit

```bash
git add src/app/components/map/OceanContours.tsx
git commit -m "feat(map): change ocean contours to solid warm brown lines"
```

---

## Task 5: Lakes + ocean background

**Files:**
- Modify: `src/app/components/map/LakesLayer.tsx`
- Modify: `src/app/components/map/SolumMap.css`

### Step 1: Update LakesLayer to solid sage fill

In `LakesLayer.tsx`, replace the entire JSX inside `<SVGOverlay>`:

```tsx
<SVGOverlay bounds={bounds} pane="lakePane" interactive={false}>
	<svg viewBox={`0 0 ${MAP_CONFIG.SVG_WIDTH} ${MAP_CONFIG.SVG_HEIGHT}`} preserveAspectRatio="none">
		{LAKE_POLYGONS.map((lake) => (
			<path
				key={lake.id}
				d={lake.d}
				fill="#8BA898"
				stroke="#5A7A6E"
				strokeWidth={0.8}
				opacity={0.85}
			/>
		))}
	</svg>
</SVGOverlay>
```

(Remove the `<defs>` block with the hatch pattern — it's no longer needed.)

### Step 2: Update ocean background in SolumMap.css

Replace the `.solum-map` rule's `background-color` and `background-image`:

```css
.solum-map {
	/* Warm khaki ocean with faint cartographic grid */
	background-color: #C4BB9A;
	background-image:
		linear-gradient(rgba(0, 0, 0, 0.07) 1px, transparent 1px),
		linear-gradient(90deg, rgba(0, 0, 0, 0.07) 1px, transparent 1px);
	background-size: 48px 48px;
	border: 2px solid var(--color-stone);
}
```

Keep all other `.solum-map` rules (zoom controls, tooltips, etc.) unchanged.

### Step 3: Verify

```bash
npm run build -- --webpack 2>&1 | tail -5
```

In the browser:
- Ocean should be warm khaki `#C4BB9A` with a faint grid (not light parchment with horizontal lines)
- Lakes should be solid muted sage blue-green (not hatched)

### Step 4: Commit

```bash
git add src/app/components/map/LakesLayer.tsx src/app/components/map/SolumMap.css
git commit -m "feat(map): solid sage lakes and warm khaki grid ocean background"
```

---

## Task 6: Final verification

### Step 1: Full build

```bash
npm run build -- --webpack 2>&1 | tail -10
```

Expected: clean build, no TypeScript errors.

### Step 2: Run tests

```bash
npm test
```

Expected: 105 tests pass (these changes don't touch any tested code).

### Step 3: Visual checklist at `/map`

- [ ] Ocean is warm khaki with faint grid
- [ ] Contour rings around islands are solid warm brown (not dashed dark)
- [ ] Land areas show distinct biome colours (forest = olive, glacier = cream, Terrae Mortuae = dark brown)
- [ ] Relief icons are denser and tinted warm parchment-brown
- [ ] Lakes are solid sage blue-green
- [ ] Region hover/click/focus still works
- [ ] Zoom controls still render
- [ ] Labels and capitals still visible
