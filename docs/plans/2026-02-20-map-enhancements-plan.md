# Map Enhancements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add true biome geometry, fixed ocean contour rings (following actual coastlines not political borders), paper grain, cartographic grid over land, compass rose/title block, and a pencil annotation layer to the Solum interactive map.

**Architecture:** Two build script changes regenerate `biome-data.ts` (new) and fix ocean contours in `map-data.ts`; five new/modified frontend components handle rendering. No new npm dependencies (Rough.js already installed and used in CoastlineShadow.tsx).

**Tech Stack:** React, TypeScript, react-leaflet SVGOverlay, Leaflet panes, SVG filters, Rough.js.

**Design doc:** `docs/plans/2026-02-20-map-enhancements-design.md`

**No unit tests** — visual rendering changes only. Verification: `npm run build -- --webpack` (must be clean) + visual check at `/map`.

---

## Key context

### Azgaar .map file structure
All SVG content is on a single line identified by `<g id="viewbox"`. Key groups within it:
- `<g id="biomes">` — biome geometry paths in SVG space, each `<path>` has a `fill` matching Azgaar's biome color palette
- `<g id="coastline">` — unified landmass boundary paths (not per-region; the pre-computed merged coastline)
- `<g id="terrain">` — terrain icon `<use>` placements
- `<g id="rivers">` — river Bézier paths

### Coordinate spaces
- **SVG space**: `x ∈ [0, 1438]`, `y ∈ [0, 755]` (Azgaar native)
- **CRS.Simple**: `lng = svgX / 32`, `lat = -svgY / 32` (Leaflet)
- **SVGOverlay with `viewBox="0 0 1438 755" preserveAspectRatio="none"`** maps SVG space directly to map bounds — so biome paths and coastline paths can be rendered as-is without any coordinate transform
- **CRS.Simple → SVG** (for annotation layer): `svgX = lng * 32`, `svgY = -lat * 32`

### `parseSvgPath()` — current issue
This function (which converts SVG M/L path strings → CRS.Simple coordinate rings) is defined **inside** `extractRegions()`. It needs to be moved to module level so `extractCoastline()` can reuse it. It currently accesses `scaleX`/`scaleY` from the enclosing scope — when moved to module level, compute them from `maxZoom` (which is already module-level).

### Layer z-index stack (target state after this plan)
```
coastlineShadowPane  140
biomeFillPane        145
contourPane          150
gridPane             160
grainPane            170
lakePane             200
reliefPane           250
overlayPane          400
regionShadowPane     395
roughBordersPane     410
riverPane            420
annotationPane       445
spotlightPane        450
markerPane           600
```

---

## Task 1: Build script — refactor parseSvgPath() to module level + add extractCoastline()

**Files:**
- Modify: `scripts/generate-tiles.mjs`

### Step 1: Move parseSvgPath() to module level

Find `parseSvgPath()` defined around line 201, inside the `extractRegions()` function body. It currently captures `scaleX` and `scaleY` from the enclosing `extractRegions()` scope.

Cut the entire function definition out of `extractRegions()` and paste it **before** `extractRegions()` at module level. Update it to compute its own scale factors from the module-level `maxZoom`:

```javascript
function parseSvgPath(d) {
	const divisor = Math.pow(2, maxZoom);
	const scaleX = 1 / divisor;
	const scaleY = 1 / divisor;

	const rings = [];
	let currentRing = null;
	const commands = d.replace(/Z/gi, '').match(/[ML][^ML]*/g);
	if (!commands) return rings;

	for (const cmd of commands) {
		const type = cmd[0];
		const nums = cmd.substring(1).trim().split(/[,\s]+/).filter(Boolean).map(Number);

		if (type === 'M') {
			if (currentRing && currentRing.length >= 3) {
				rings.push(currentRing);
			}
			currentRing = [];
		}

		for (let i = 0; i < nums.length; i += 2) {
			const svgX = nums[i];
			const svgY = nums[i + 1];
			currentRing.push([
				Math.round(svgX * scaleX * 10000) / 10000,
				Math.round(-svgY * scaleY * 10000) / 10000,
			]);
		}
	}

	if (currentRing && currentRing.length >= 3) {
		rings.push(currentRing);
	}

	for (const ring of rings) {
		const first = ring[0];
		const last = ring[ring.length - 1];
		if (first[0] !== last[0] || first[1] !== last[1]) {
			ring.push([first[0], first[1]]);
		}
	}

	return rings;
}
```

Inside `extractRegions()`, remove the now-duplicate local definition. The call `parseSvgPath(pathD)` inside `extractRegions()` continues to work unchanged (now calls the module-level function).

### Step 2: Add extractCoastline() after extractRegions()

```javascript
// ---------------------------------------------------------------------------
// Extract unified coastline rings from <g id="coastline">
// ---------------------------------------------------------------------------

function extractCoastline(mapData) {
	console.log('\n=== Coastline Extraction ===');
	const { lines, svgLineIdx } = mapData;
	const svgLine = lines[svgLineIdx];

	const coastlineStart = svgLine.indexOf('<g id="coastline"');
	if (coastlineStart === -1) {
		console.warn('Warning: could not find <g id="coastline"> group');
		return [];
	}

	const coastlineEnd = svgLine.indexOf('</g>', coastlineStart);
	const coastlineContent = svgLine.substring(coastlineStart, coastlineEnd);

	const allRings = [];
	const pathRegex = /\sd="([^"]+)"/g;
	let match;
	while ((match = pathRegex.exec(coastlineContent)) !== null) {
		const rings = parseSvgPath(match[1]);
		allRings.push(...rings);
	}

	console.log('Found ' + allRings.length + ' coastline rings');
	return allRings;
}
```

### Step 3: Verify build still works

```bash
npm run build -- --webpack 2>&1 | tail -5
```

Expected: clean build. If there's an error about `parseSvgPath` scope, double-check that the local definition was fully removed from `extractRegions()`.

### Step 4: Commit

```bash
git add scripts/generate-tiles.mjs
git commit -m "refactor(map): move parseSvgPath to module level, add extractCoastline"
```


---

## Task 2: Build script — fix generateOceanContours() + add extractBiomeGeometry() + writeBiomeData() + update main()

**Files:**
- Modify: `scripts/generate-tiles.mjs`
- Creates (via script run): `src/lib/biome-data.ts`, updated `src/lib/map-data.ts`

### Step 1: Fix generateOceanContours() to use coastline rings

The current `generateOceanContours(geojson)` iterates `geojson.features` (individual region polygons), incorrectly creating contour rings along internal political borders.

**Replace the function signature and core loop.** Keep `signedArea()`, `lineIntersection()`, and `offsetRing()` unchanged. Change:

1. **Signature:** `function generateOceanContours(coastlineRings)` — takes an array of CRS.Simple coordinate rings directly

2. **OFFSETS** — replace 8-element array with 12 levels, tighter inner spacing:
```javascript
const OFFSETS = [0.02, 0.05, 0.09, 0.14, 0.20, 0.27, 0.35, 0.44, 0.54, 0.65, 0.77, 0.90];
```

3. **Inner loop** — replace the `for (const feature of geojson.features)` block with:
```javascript
for (let depth = 0; depth < OFFSETS.length; depth++) {
	const distance = OFFSETS[depth];
	const contourLines = [];

	for (const ring of coastlineRings) {
		if (ring.length < 4) continue;
		const offset = offsetRing(ring, distance);
		if (offset && offset.length >= 4) {
			contourLines.push(offset);
		}
	}

	if (contourLines.length > 0) {
		features.push({
			type: 'Feature',
			properties: { depth: depth + 1 },
			geometry: {
				type: 'MultiLineString',
				coordinates: contourLines,
			},
		});
		const totalVerts = contourLines.reduce((sum, l) => sum + l.length, 0);
		console.log('  Depth ' + (depth + 1) + ' (offset ' + distance + '): ' + contourLines.length + ' contours, ' + totalVerts + ' vertices');
	}
}
```

4. Update opening log: `'\n=== Ocean Contour Generation (coastline-based) ==='`

### Step 2: Add extractBiomeGeometry()

Add after `extractCoastline()`:

```javascript
// ---------------------------------------------------------------------------
// Extract biome geometry paths from <g id="biomes">
// ---------------------------------------------------------------------------

function extractBiomeGeometry(mapData) {
	console.log('\n=== Biome Geometry Extraction ===');
	const { lines, svgLineIdx } = mapData;
	const svgLine = lines[svgLineIdx];

	// Azgaar biome fill color → warm antique palette
	const AZGAAR_TO_WARM = {
		'#53679f': 'transparent', // Marine — skip
		'#fbe79f': '#D4C87A',     // Hot desert
		'#b5b887': '#C8BA88',     // Cold desert
		'#d2d082': '#C8C49A',     // Savanna
		'#c8d68f': '#C4C490',     // Grassland
		'#b6d95d': '#A8B07A',     // Tropical seasonal forest
		'#29bc56': '#9EA878',     // Temperate deciduous forest
		'#7dcb35': '#A0AA72',     // Tropical rain forest
		'#45b348': '#9CA876',     // Temperate rain forest
		'#4b6b32': '#A0A87A',     // Taiga
		'#96784b': '#C0B890',     // Tundra
		'#d5e7eb': '#E4E0D0',     // Glacier
		'#0b9131': '#8E9870',     // Wetland
	};
	const DEFAULT_WARM = '#D0C98A';

	const biomesStart = svgLine.indexOf('<g id="biomes"');
	if (biomesStart === -1) {
		console.warn('Warning: could not find <g id="biomes"> group');
		return [];
	}

	const biomesEnd = svgLine.indexOf('</g>', biomesStart);
	const biomesContent = svgLine.substring(biomesStart, biomesEnd);

	const biomePaths = [];

	// Try d-attribute-first ordering
	const pathRegex = /<path[^>]*\sd="([^"]+)"[^>]*\sfill="([^"]+)"[^>]*/g;
	let match;
	while ((match = pathRegex.exec(biomesContent)) !== null) {
		const d = match[1];
		const azgaarFill = match[2].toLowerCase();
		const warmFill = AZGAAR_TO_WARM[azgaarFill] ?? DEFAULT_WARM;
		if (warmFill === 'transparent') continue;
		biomePaths.push({ d, fill: warmFill });
	}

	// Try fill-attribute-first ordering if nothing found
	if (biomePaths.length === 0) {
		const pathRegex2 = /<path[^>]*\sfill="([^"]+)"[^>]*\sd="([^"]+)"[^>]*/g;
		while ((match = pathRegex2.exec(biomesContent)) !== null) {
			const azgaarFill = match[1].toLowerCase();
			const d = match[2];
			const warmFill = AZGAAR_TO_WARM[azgaarFill] ?? DEFAULT_WARM;
			if (warmFill === 'transparent') continue;
			biomePaths.push({ d, fill: warmFill });
		}
	}

	console.log('Found ' + biomePaths.length + ' biome paths');
	return biomePaths;
}
```

### Step 3: Add writeBiomeData()

Add after `writeRiverData()`:

```javascript
// ---------------------------------------------------------------------------
// Write src/lib/biome-data.ts
// ---------------------------------------------------------------------------

function writeBiomeData(biomePaths) {
	const tsLines = [
		'/**',
		' * Biome geometry paths extracted from Azgaar Fantasy Map Generator.',
		' * Generated by scripts/generate-tiles.mjs — do not edit by hand.',
		' * Paths are in SVG coordinate space (0 0 1438 755) — no transform needed for SVGOverlay.',
		' */',
		'',
		'export interface BiomePath {',
		'\td: string;',
		'\tfill: string;',
		'}',
		'',
		'export const BIOME_PATHS: BiomePath[] = ' + JSON.stringify(biomePaths, null, '\t') + ';',
		'',
	];

	const outPath = resolve('src/lib/biome-data.ts');
	writeFileSync(outPath, tsLines.join('\n'), 'utf-8');
	console.log('Wrote ' + outPath + ' (' + biomePaths.length + ' biome paths)');
}
```

### Step 4: Update main()

In `main()`:
1. Add `const coastlineRings = extractCoastline(mapData);` after `extractRegions()`
2. Add `const biomePaths = extractBiomeGeometry(mapData);` after `coastlineRings`
3. Change `generateOceanContours(data.geojson)` → `generateOceanContours(coastlineRings)`
4. Add `writeBiomeData(biomePaths);` in the write section

```javascript
function main() {
	const mapData = parseMapFile();
	const { svgW, svgH } = mapData;
	const data = extractRegions(mapData);
	const coastlineRings = extractCoastline(mapData);
	const biomePaths = extractBiomeGeometry(mapData);
	const capitals = extractCapitals(mapData);
	const { biomeLegend, regionBiomes } = extractBiomes(mapData);
	const relief = extractRelief(mapData);
	const clusters = computeTerrainClusters(relief);
	const rivers = extractRivers(mapData);
	const lakes = extractLakes(mapData);
	const oceanContours = generateOceanContours(coastlineRings);
	writeMapData({ ...data, capitals, biomeLegend, regionBiomes, oceanContours, svgW, svgH });
	writeReliefData(relief);
	writeRiverData(rivers);
	writeLakeData(lakes);
	writeClusterData(clusters);
	writeBiomeData(biomePaths);

	console.log('\n=== Done! ===');
	console.log('Next steps:');
	console.log('1. Run `npm run dev` and navigate to /map');
	console.log('2. Add codexSlug values to MAP_REGIONS in src/lib/map-data.ts');
}
```

### Step 5: Run the build script

```bash
node scripts/generate-tiles.mjs mapfiles/SOLUM-PR.map
```

Expected output includes:
```
=== Coastline Extraction ===
Found N coastline rings

=== Biome Geometry Extraction ===
Found N biome paths

=== Ocean Contour Generation (coastline-based) ===
  Depth 1 ... Depth 12 ...

Wrote src/lib/biome-data.ts (N biome paths)
Wrote src/lib/map-data.ts
```

**If `coastlineRings` is 0:** The `<g id="coastline">` regex didn't match. Log `svgLine.substring(coastlineStart, coastlineStart + 200)` to inspect the group structure and adjust accordingly. Do not proceed until coastline rings > 0.

**If `biomePaths` is 0:** Log `biomesContent.substring(0, 500)` to inspect the `<g id="biomes">` structure, then adjust the regex attribute-ordering accordingly.

### Step 6: Verify TypeScript

```bash
npm run build -- --webpack 2>&1 | tail -5
```

Expected: clean build.

### Step 7: Commit

```bash
git add scripts/generate-tiles.mjs src/lib/biome-data.ts src/lib/map-data.ts
git commit -m "feat(map): true biome geometry + coastline-based ocean contours (12 levels)"
```


---

## Task 3: Update BiomeFillLayer.tsx to use BIOME_PATHS

**Files:**
- Modify: `src/app/components/map/BiomeFillLayer.tsx`

### Step 1: Replace file contents

The updated BiomeFillLayer renders `BIOME_PATHS` (true Azgaar biome SVG geometry, no coordinate transform needed) then overlays Terrae Mortuae regions in dark brown using REGION_BOUNDARIES.

```tsx
'use client';

import { useState, useEffect } from 'react';
import { SVGOverlay, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MAP_CONFIG, REGION_BOUNDARIES, MAP_REGIONS } from '@/lib/map-data';
import { BIOME_PATHS } from '@/lib/biome-data';

const DEAD_LAND_FILL = '#3A2E10';

const deadLandIds = new Set(
	MAP_REGIONS
		.filter((r) => r.name.includes('Terrae Mortuae'))
		.map((r) => r.id)
);

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
				{/* True biome geometry from Azgaar — already in SVG space, no transform needed */}
				{BIOME_PATHS.map((bp, i) => (
					<path key={i} d={bp.d} fill={bp.fill} stroke="none" />
				))}
				{/* Terrae Mortuae override — rendered on top in dark brown */}
				{REGION_BOUNDARIES.features
					.filter((f) => deadLandIds.has(f.properties?.regionId as string))
					.map((feature, i) => {
						const geom = feature.geometry;
						if (geom.type === 'Polygon') {
							const d = ringToSvgPath(geom.coordinates[0] as number[][]);
							return <path key={`dead-${i}`} d={d} fill={DEAD_LAND_FILL} stroke="none" />;
						}
						if (geom.type === 'MultiPolygon') {
							const d = (geom.coordinates as number[][][][])
								.map((poly) => ringToSvgPath(poly[0]))
								.join(' ');
							return <path key={`dead-${i}`} d={d} fill={DEAD_LAND_FILL} stroke="none" />;
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
npm run build -- --webpack 2>&1 | grep -E "error|BiomeFill|biome-data"
```

Expected: no errors.

### Step 3: Commit

```bash
git add src/app/components/map/BiomeFillLayer.tsx
git commit -m "feat(map): BiomeFillLayer renders true Azgaar biome geometry"
```

---

## Task 4: Update OceanContours.tsx for 12 depth levels

**Files:**
- Modify: `src/app/components/map/OceanContours.tsx`

### Step 1: Extend CONTOUR_STYLES to 12 levels

The regenerated `OCEAN_CONTOURS` now has up to 12 depth levels. OceanContours.tsx only has styles for 1–8. Add 9–12 continuing the graduated fade:

```typescript
const CONTOUR_STYLES: Record<number, L.PathOptions> = {
	1:  { color: '#6B5B3E', weight: 1.2,  opacity: 0.55 },
	2:  { color: '#6B5B3E', weight: 1.0,  opacity: 0.45 },
	3:  { color: '#6B5B3E', weight: 0.9,  opacity: 0.37 },
	4:  { color: '#6B5B3E', weight: 0.8,  opacity: 0.30 },
	5:  { color: '#6B5B3E', weight: 0.7,  opacity: 0.23 },
	6:  { color: '#6B5B3E', weight: 0.6,  opacity: 0.17 },
	7:  { color: '#6B5B3E', weight: 0.5,  opacity: 0.12 },
	8:  { color: '#6B5B3E', weight: 0.45, opacity: 0.09 },
	9:  { color: '#6B5B3E', weight: 0.4,  opacity: 0.07 },
	10: { color: '#6B5B3E', weight: 0.35, opacity: 0.05 },
	11: { color: '#6B5B3E', weight: 0.3,  opacity: 0.04 },
	12: { color: '#6B5B3E', weight: 0.25, opacity: 0.03 },
};
```

No other changes needed — the style callback already falls back to level 1 for unknown depths.

### Step 2: Verify and commit

```bash
npm run build -- --webpack 2>&1 | grep -E "error|OceanContours"
git add src/app/components/map/OceanContours.tsx
git commit -m "feat(map): extend ocean contour styles to 12 depth levels"
```

---

## Task 5: Create GrainOverlay.tsx and GridLayer.tsx

**Files:**
- Create: `src/app/components/map/GrainOverlay.tsx`
- Create: `src/app/components/map/GridLayer.tsx`

### Step 1: Create GrainOverlay.tsx

```tsx
'use client';

import { useState, useEffect } from 'react';
import { SVGOverlay, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MAP_CONFIG } from '@/lib/map-data';

/** Warm brownish paper grain texture at ~10% opacity over the whole map. */
const GrainOverlay = () => {
	const map = useMap();
	const [paneReady, setPaneReady] = useState(false);

	useEffect(() => {
		if (!map.getPane('grainPane')) {
			map.createPane('grainPane');
		}
		map.getPane('grainPane')!.style.zIndex = '170';
		setPaneReady(true);
	}, [map]);

	if (!paneReady) return null;

	const bounds = L.latLngBounds(
		L.latLng(MAP_CONFIG.BOUNDS_SW[0], MAP_CONFIG.BOUNDS_SW[1]),
		L.latLng(MAP_CONFIG.BOUNDS_NE[0], MAP_CONFIG.BOUNDS_NE[1])
	);

	return (
		<SVGOverlay bounds={bounds} pane="grainPane" interactive={false}>
			<svg
				viewBox={`0 0 ${MAP_CONFIG.SVG_WIDTH} ${MAP_CONFIG.SVG_HEIGHT}`}
				preserveAspectRatio="none"
			>
				<defs>
					<filter id="paper-grain">
						<feTurbulence
							type="fractalNoise"
							baseFrequency="0.9 0.9"
							numOctaves={4}
							seed={2}
							result="noise"
						/>
						<feColorMatrix
							type="matrix"
							values="0 0 0 0 0.4  0 0 0 0 0.35  0 0 0 0 0.25  0 0 0 0.10 0"
							in="noise"
						/>
					</filter>
				</defs>
				<rect
					width={MAP_CONFIG.SVG_WIDTH}
					height={MAP_CONFIG.SVG_HEIGHT}
					filter="url(#paper-grain)"
				/>
			</svg>
		</SVGOverlay>
	);
};

export default GrainOverlay;
```

### Step 2: Create GridLayer.tsx

Extends the CSS grid pattern (currently ocean-only via `SolumMap.css` background-image) over land areas as well.

```tsx
'use client';

import { useState, useEffect } from 'react';
import { SVGOverlay, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MAP_CONFIG } from '@/lib/map-data';

/** Faint cartographic grid over the entire map (land + ocean). */
const GridLayer = () => {
	const map = useMap();
	const [paneReady, setPaneReady] = useState(false);

	useEffect(() => {
		if (!map.getPane('gridPane')) {
			map.createPane('gridPane');
		}
		map.getPane('gridPane')!.style.zIndex = '160';
		setPaneReady(true);
	}, [map]);

	if (!paneReady) return null;

	const bounds = L.latLngBounds(
		L.latLng(MAP_CONFIG.BOUNDS_SW[0], MAP_CONFIG.BOUNDS_SW[1]),
		L.latLng(MAP_CONFIG.BOUNDS_NE[0], MAP_CONFIG.BOUNDS_NE[1])
	);

	return (
		<SVGOverlay bounds={bounds} pane="gridPane" interactive={false}>
			<svg
				viewBox={`0 0 ${MAP_CONFIG.SVG_WIDTH} ${MAP_CONFIG.SVG_HEIGHT}`}
				preserveAspectRatio="none"
			>
				<defs>
					<pattern
						id="map-grid"
						width={48}
						height={48}
						patternUnits="userSpaceOnUse"
					>
						<line x1={0} y1={0} x2={0} y2={48} stroke="rgba(0,0,0,0.06)" strokeWidth={0.5} />
						<line x1={0} y1={0} x2={48} y2={0} stroke="rgba(0,0,0,0.06)" strokeWidth={0.5} />
					</pattern>
				</defs>
				<rect
					width={MAP_CONFIG.SVG_WIDTH}
					height={MAP_CONFIG.SVG_HEIGHT}
					fill="url(#map-grid)"
				/>
			</svg>
		</SVGOverlay>
	);
};

export default GridLayer;
```

### Step 3: Verify and commit

```bash
npm run build -- --webpack 2>&1 | grep -E "error|GrainOverlay|GridLayer"
git add src/app/components/map/GrainOverlay.tsx src/app/components/map/GridLayer.tsx
git commit -m "feat(map): add GrainOverlay (paper texture) and GridLayer (cartographic grid)"
```


---

## Task 6: Create MapCompass.tsx

**Files:**
- Create: `src/app/components/map/MapCompass.tsx`

This is an absolutely positioned HTML div rendered **outside** `<MapContainer>` but inside `<div className="relative">` in SolumMap.tsx. It uses no Leaflet or react-leaflet — just HTML and inline SVG. No `'use client'` directive needed since MapCompass is imported by the `'use client'` SolumMap.tsx.

### Step 1: Create MapCompass.tsx

```tsx
/** Compass rose + title block, fixed in the map's top-left corner. */
const MapCompass = () => {
	return (
		<div
			style={{
				position: 'absolute',
				top: '12px',
				left: '12px',
				zIndex: 1000,
				padding: '10px 12px',
				background: 'rgba(245, 240, 225, 0.85)',
				border: '1px solid rgba(107, 91, 62, 0.4)',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				gap: '6px',
				pointerEvents: 'none',
				userSelect: 'none',
			}}
		>
			{/* 8-pointed compass star */}
			<svg width={48} height={48} viewBox="0 0 48 48" fill="none">
				{/* Cardinal points — N is taller/more prominent */}
				<polygon points="24,2 27,18 24,22 21,18" fill="#6B5B3E" />
				<polygon points="24,46 21,30 24,26 27,30" fill="#6B5B3E" opacity={0.6} />
				<polygon points="2,24 18,21 22,24 18,27" fill="#6B5B3E" opacity={0.6} />
				<polygon points="46,24 30,27 26,24 30,21" fill="#6B5B3E" opacity={0.6} />
				{/* Intercardinal points — smaller */}
				<polygon points="24,24 11,11 15,24" fill="#6B5B3E" opacity={0.35} />
				<polygon points="24,24 37,11 33,24" fill="#6B5B3E" opacity={0.35} />
				<polygon points="24,24 11,37 24,33" fill="#6B5B3E" opacity={0.35} />
				<polygon points="24,24 37,37 24,33" fill="#6B5B3E" opacity={0.35} />
				{/* N label above north point */}
				<text
					x={24}
					y={9}
					textAnchor="middle"
					fill="#6B5B3E"
					fontSize={7}
					fontFamily="Marcellus, Georgia, serif"
					fontWeight="bold"
				>
					N
				</text>
			</svg>
			{/* Map title */}
			<div
				style={{
					fontFamily: 'Marcellus, Georgia, serif',
					fontSize: '14px',
					letterSpacing: '0.2em',
					color: '#3A2E10',
					textTransform: 'uppercase',
					lineHeight: 1,
				}}
			>
				SOLUM
			</div>
			{/* Subtitle */}
			<div
				style={{
					fontFamily: 'Georgia, serif',
					fontSize: '9px',
					letterSpacing: '0.1em',
					color: '#6B5B3E',
					lineHeight: 1,
				}}
			>
				350 POST RUINAM
			</div>
		</div>
	);
};

export default MapCompass;
```

### Step 2: Verify and commit

```bash
npm run build -- --webpack 2>&1 | grep -E "error|MapCompass"
git add src/app/components/map/MapCompass.tsx
git commit -m "feat(map): add MapCompass with compass rose and title block"
```

---

## Task 7: Create AnnotationLayer.tsx

**Files:**
- Create: `src/app/components/map/AnnotationLayer.tsx`

Renders pencil-style map annotations via Rough.js:
1. A dashed route line through all capital positions (in order from MAP_CAPITALS)
2. Warning circles near Terrae Mortuae region centroids
3. Static "Unexplored?" italic text near the right map edge

Accepts a `visible: boolean` prop. The toggle button lives in SolumMap.tsx (Task 8).

### Step 1: How the drawing effect works

The component uses the `useRef + useEffect` pattern from CoastlineShadow.tsx:
- `svgRef` attaches to the `<svg>` element inside SVGOverlay
- `gRef` attaches to a `<g>` element where Rough.js draws
- When `visible` changes to true, SVGOverlay renders (refs become set), then the drawing effect fires

The drawing effect dependency array is `[paneReady, visible]`. React runs effects after DOM commits, so refs are set by the time the effect runs.

Coordinate conversion (CRS.Simple → SVG space, needed for MAP_CAPITALS and region centroids):
- `svgX = lng * 32`
- `svgY = -lat * 32`

For Rough.js dashed lines, use `lineDash: [6, 4]` (not `strokeLineDash`).

### Step 2: Create AnnotationLayer.tsx

```tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { SVGOverlay, useMap } from 'react-leaflet';
import L from 'leaflet';
import rough from 'roughjs';
import { MAP_CONFIG, MAP_CAPITALS, REGION_BOUNDARIES, MAP_REGIONS } from '@/lib/map-data';

function toSvgX(lng: number): number { return lng * 32; }
function toSvgY(lat: number): number { return -lat * 32; }

function ringCentroid(ring: number[][]): [number, number] {
	let minLng = Infinity, maxLng = -Infinity;
	let minLat = Infinity, maxLat = -Infinity;
	for (const [lng, lat] of ring) {
		if (lng < minLng) minLng = lng;
		if (lng > maxLng) maxLng = lng;
		if (lat < minLat) minLat = lat;
		if (lat > maxLat) maxLat = lat;
	}
	return [(minLng + maxLng) / 2, (minLat + maxLat) / 2];
}

const DEAD_LAND_IDS = new Set(
	MAP_REGIONS
		.filter((r) => r.name.includes('Terrae Mortuae'))
		.map((r) => r.id)
);

const PENCIL_STYLE = {
	stroke: '#8A7A6A',
	strokeWidth: 1.0,
	roughness: 1.2,
	fill: 'none',
} as const;

interface AnnotationLayerProps {
	visible: boolean;
}

const AnnotationLayer = ({ visible }: AnnotationLayerProps) => {
	const map = useMap();
	const [paneReady, setPaneReady] = useState(false);
	const svgRef = useRef<SVGSVGElement>(null);
	const gRef = useRef<SVGGElement>(null);

	useEffect(() => {
		if (!map.getPane('annotationPane')) {
			map.createPane('annotationPane');
		}
		map.getPane('annotationPane')!.style.zIndex = '445';
		setPaneReady(true);
	}, [map]);

	useEffect(() => {
		if (!paneReady || !visible || !gRef.current || !svgRef.current) return;

		const g = gRef.current;
		while (g.firstChild) g.removeChild(g.firstChild);

		const rc = rough.svg(svgRef.current);

		// Route line through all capitals in order
		const capitalPoints: [number, number][] = MAP_CAPITALS.map((c) => [
			toSvgX(c.lng),
			toSvgY(c.lat),
		]);
		if (capitalPoints.length >= 2) {
			g.appendChild(rc.linearPath(capitalPoints, {
				...PENCIL_STYLE,
				lineDash: [6, 4],
			}));
		}

		// Warning circles near Terrae Mortuae region centroids
		for (const feature of REGION_BOUNDARIES.features) {
			if (!DEAD_LAND_IDS.has(feature.properties?.regionId as string)) continue;
			const geom = feature.geometry;
			let ring: number[][] | null = null;
			if (geom.type === 'Polygon') {
				ring = geom.coordinates[0] as number[][];
			} else if (geom.type === 'MultiPolygon') {
				ring = (geom.coordinates as number[][][][])[0][0];
			}
			if (!ring) continue;
			const [cLng, cLat] = ringCentroid(ring);
			g.appendChild(rc.circle(toSvgX(cLng), toSvgY(cLat), 30, {
				...PENCIL_STYLE,
				roughness: 1.5,
			}));
		}
	}, [paneReady, visible]);

	if (!paneReady || !visible) return null;

	const bounds = L.latLngBounds(
		L.latLng(MAP_CONFIG.BOUNDS_SW[0], MAP_CONFIG.BOUNDS_SW[1]),
		L.latLng(MAP_CONFIG.BOUNDS_NE[0], MAP_CONFIG.BOUNDS_NE[1])
	);

	return (
		<SVGOverlay bounds={bounds} pane="annotationPane" interactive={false}>
			<svg
				ref={svgRef}
				viewBox={`0 0 ${MAP_CONFIG.SVG_WIDTH} ${MAP_CONFIG.SVG_HEIGHT}`}
				preserveAspectRatio="none"
			>
				<g ref={gRef} />
				<text
					x={1350}
					y={200}
					fontStyle="italic"
					fill="#8A7A6A"
					opacity={0.5}
					fontSize={10}
					fontFamily="Georgia, serif"
				>
					Unexplored?
				</text>
			</svg>
		</SVGOverlay>
	);
};

export default AnnotationLayer;
```

**Troubleshooting:** If Rough.js TypeScript types complain about `lineDash`, check the installed version. Roughjs v4+ uses `lineDash: number[]`. If using an older version, try `strokeLineDash` instead. Run `npm list roughjs` to check the version.

### Step 3: Verify and commit

```bash
npm run build -- --webpack 2>&1 | grep -E "error|AnnotationLayer"
git add src/app/components/map/AnnotationLayer.tsx
git commit -m "feat(map): add AnnotationLayer with pencil-style route, warning circles, unexplored text"
```

---

## Task 8: Wire all new components into SolumMap.tsx + final verification

**Files:**
- Modify: `src/app/components/map/SolumMap.tsx`

### Step 1: Add imports

After the existing imports, add:

```typescript
import GrainOverlay from './GrainOverlay';
import GridLayer from './GridLayer';
import MapCompass from './MapCompass';
import AnnotationLayer from './AnnotationLayer';
import { mdiPencil } from '@mdi/js';
```

### Step 2: Add annotation visibility state inside SolumMap

After the existing `const [focusedRegion, ...]` declaration, add:

```typescript
const [annotationsVisible, setAnnotationsVisible] = useState<boolean>(() => {
	if (typeof window === 'undefined') return true;
	return localStorage.getItem('atom-magic-map-annotations-visible') !== 'false';
});

const toggleAnnotations = useCallback(() => {
	setAnnotationsVisible((v) => {
		const next = !v;
		localStorage.setItem('atom-magic-map-annotations-visible', next ? 'true' : 'false');
		return next;
	});
}, []);
```

(`useCallback` is already imported — check the existing imports in SolumMap.tsx.)

### Step 3: Add GridLayer and GrainOverlay inside MapContainer

After `<OceanContours />`, add:
```tsx
<GridLayer />
<GrainOverlay />
```

### Step 4: Add AnnotationLayer inside MapContainer

After `<RiversLayer />`, add:
```tsx
<AnnotationLayer visible={annotationsVisible} />
```

### Step 5: Add MapCompass and toggle button to outer div

The outer `<div className="relative">` holds `<MapContainer>` and optionally `<RegionFocusPanel>`. Add MapCompass and the toggle button as direct children of this div (siblings to MapContainer):

```tsx
<div className="relative">
	<MapContainer ...>
		{/* ... existing layers ... */}
	</MapContainer>
	<MapCompass />
	<button
		onClick={toggleAnnotations}
		title={annotationsVisible ? 'Hide annotations' : 'Show annotations'}
		style={{
			position: 'absolute',
			bottom: '12px',
			left: '12px',
			zIndex: 1000,
			width: '32px',
			height: '32px',
			background: annotationsVisible ? 'rgba(107, 91, 62, 0.85)' : 'rgba(245, 240, 225, 0.85)',
			border: '1px solid rgba(107, 91, 62, 0.4)',
			cursor: 'pointer',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			padding: 0,
		}}
	>
		<svg width={18} height={18} viewBox="0 0 24 24">
			<path
				d={mdiPencil}
				fill={annotationsVisible ? '#F5F0E1' : '#6B5B3E'}
			/>
		</svg>
	</button>
	{focusedRegion && <RegionFocusPanel ... />}
</div>
```

### Step 6: Final build check

```bash
npm run build -- --webpack 2>&1 | tail -10
```

Expected: clean build, no TypeScript errors.

### Step 7: Run tests

```bash
npm test
```

Expected: 105 tests pass.

### Step 8: Visual checklist at /map

Start: `npm run dev` → open `/map`

- [ ] Biome fills reflect true Azgaar geometry (forests olive, glacier cream, Terrae Mortuae dark)
- [ ] Ocean contour rings follow actual coastlines (island shapes), not internal region borders
- [ ] 12 contour levels visible, fading gracefully at outer rings
- [ ] Faint cartographic grid visible over land areas (not just ocean)
- [ ] Subtle paper grain texture over entire map
- [ ] Compass rose in top-left with "SOLUM" and "350 POST RUINAM"
- [ ] Pencil toggle button in bottom-left; clicking toggles annotations on/off
- [ ] Annotation state persists across page reload (localStorage)
- [ ] Route line connects capital cities in hand-drawn dashed style
- [ ] Warning circles near Terrae Mortuae regions
- [ ] "Unexplored?" italic text near right edge
- [ ] Region hover/click/focus still works
- [ ] Zoom controls render and function
- [ ] Labels and capitals still visible

### Step 9: Commit

```bash
git add src/app/components/map/SolumMap.tsx
git commit -m "feat(map): wire GrainOverlay, GridLayer, MapCompass, AnnotationLayer into SolumMap"
```
