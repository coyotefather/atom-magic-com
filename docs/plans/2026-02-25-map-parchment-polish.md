# Map Parchment Polish Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the interactive map look like everything is drawn on a single piece of parchment — unified warm background, bolder spaced contours, no overlapping labels, non-italic city text, and RoughJS on lakes/borders.

**Architecture:** Six independent changes committed separately: (1) parchment color palette, (2) ocean contour script + styles, (3) lake RoughJS, (4) city label italic removal, (5) label deconfliction + city clearance zones, (6) rougher border settings. All filter/layout computation runs once at module load.

**Tech Stack:** React, TypeScript, SVG, Leaflet/react-leaflet, roughjs, Node.js (build script), Vitest.

---

### Task 1: Parchment Palette — Ocean, Land Fills, Coastline Fill

**Files:**
- Modify: `src/app/components/map/SolumMap.css:5`
- Modify: `src/app/components/map/BiomeFillLayer.tsx:9-25` (colors + opacity)
- Modify: `src/app/components/map/CoastlineShadow.tsx:52`

**Step 1: Update ocean background**

In `src/app/components/map/SolumMap.css`, change line 5:
```css
background-color: #BACDD8;
```
to:
```css
background-color: #EAE4D0;
```

**Step 2: Update biome fill colors and opacity**

In `src/app/components/map/BiomeFillLayer.tsx`, replace lines 9–25:
```typescript
// Parchment-wash colours per Azgaar biome ID — very light tints at low opacity
const BIOME_FILL_COLORS: Record<number, string> = {
	11: '#DDD8C8', // Glacier — cool cream
	9:  '#B8BF90', // Taiga — muted sage
	6:  '#B5BF8C', // Temperate deciduous — sage-green
	8:  '#B2BE88', // Temperate rain — medium sage
	7:  '#B0BC80', // Tropical rain — deeper sage
	5:  '#B8C090', // Tropical seasonal — lighter sage
	4:  '#C8C898', // Grassland — warm tan-green
	3:  '#CCC498', // Savanna — warm tan
	2:  '#CCBA88', // Cold desert — sandy
	1:  '#D0B870', // Hot desert — warm ochre
	10: '#C8C098', // Tundra — warm tan
	12: '#A0AC88', // Wetland — grey-olive
};

const DEFAULT_FILL = '#C8C090';
const DEAD_LAND_FILL = '#7D7060'; // darker muted olive — keeps TM visually distinct
```

On both `<path>` elements for Polygon and MultiPolygon (currently at lines 83 and 89), change `fillOpacity={0.5}` to `fillOpacity={0.3}`.

**Step 3: Update CoastlineShadow fill**

In `src/app/components/map/CoastlineShadow.tsx`, change the `fill` value inside `opts` (currently `'#F5F3ED'`):
```typescript
fill: '#EDE8D5',
```

**Step 4: Verify build**
```bash
npm run build 2>&1 | tail -10
```
Expected: clean build.

**Step 5: Commit**
```bash
git add src/app/components/map/SolumMap.css src/app/components/map/BiomeFillLayer.tsx src/app/components/map/CoastlineShadow.tsx
git commit -m "feat(map): parchment palette — unified warm background, lighter biome washes"
```

---

### Task 2: Ocean Contours — Exponential Spacing + Bolder Styles

**Files:**
- Modify: `scripts/generate-tiles.mjs:842`
- Modify: `src/app/components/map/OceanContours.tsx:8-21`

**Step 1: Change contour OFFSETS in build script**

In `scripts/generate-tiles.mjs`, at line 842, change:
```js
const OFFSETS = [0.02, 0.05, 0.09, 0.14, 0.20, 0.27, 0.35, 0.44, 0.54, 0.65, 0.77, 0.90];
```
to:
```js
const OFFSETS = [0.03, 0.07, 0.13, 0.22, 0.38, 0.62, 1.00, 1.55, 2.30, 3.25, 4.40, 5.80];
```
This creates exponentially wider spacing: tight near the coast (first 3 lines), then big jumps outward.

**Step 2: Rebuild map data**
```bash
node scripts/generate-tiles.mjs mapfiles/SOLUM-PR.map
```
Expected: script completes, `src/lib/map-data.ts` regenerated. Check the output lines — 12 contour depth levels should still be reported.

**Step 3: Update CONTOUR_STYLES for bolder inner lines**

In `src/app/components/map/OceanContours.tsx`, replace lines 8–21:
```typescript
const CONTOUR_STYLES: Record<number, L.PathOptions> = {
	1:  { color: '#6B5B3E', weight: 2.0, opacity: 0.75 },
	2:  { color: '#6B5B3E', weight: 1.6, opacity: 0.62 },
	3:  { color: '#6B5B3E', weight: 1.3, opacity: 0.52 },
	4:  { color: '#6B5B3E', weight: 1.1, opacity: 0.42 },
	5:  { color: '#6B5B3E', weight: 0.9, opacity: 0.34 },
	6:  { color: '#6B5B3E', weight: 0.8, opacity: 0.27 },
	7:  { color: '#6B5B3E', weight: 0.7, opacity: 0.21 },
	8:  { color: '#6B5B3E', weight: 0.6, opacity: 0.16 },
	9:  { color: '#6B5B3E', weight: 0.55, opacity: 0.12 },
	10: { color: '#6B5B3E', weight: 0.5, opacity: 0.09 },
	11: { color: '#6B5B3E', weight: 0.45, opacity: 0.06 },
	12: { color: '#6B5B3E', weight: 0.4, opacity: 0.04 },
};
```

**Step 4: Verify build**
```bash
npm run build 2>&1 | tail -10
```
Expected: clean build.

**Step 5: Commit**
```bash
git add scripts/generate-tiles.mjs src/lib/map-data.ts src/app/components/map/OceanContours.tsx
git commit -m "feat(map): ocean contours — exponential spacing, bolder inner lines"
```

---

### Task 3: Lake RoughJS Outlines

**Files:**
- Modify: `src/app/components/map/LakesLayer.tsx`

Switch the lake layer from plain SVG paths to RoughJS-rendered outlines for a hand-drawn edge.

**Step 1: Rewrite LakesLayer.tsx**

Replace the entire file content with:
```typescript
'use client';

import { useState, useEffect, useRef } from 'react';
import { SVGOverlay, useMap } from 'react-leaflet';
import L from 'leaflet';
import rough from 'roughjs';
import { MAP_CONFIG } from '@/lib/map-data';
import { LAKE_POLYGONS } from '@/lib/lake-data';

const LakesLayer = () => {
	const map = useMap();
	const [paneReady, setPaneReady] = useState(false);
	const gRef = useRef<SVGGElement>(null);
	const svgRef = useRef<SVGSVGElement>(null);

	useEffect(() => {
		if (!map.getPane('lakePane')) {
			map.createPane('lakePane');
			map.getPane('lakePane')!.style.zIndex = '200';
		}
		setPaneReady(true);
	}, [map]);

	useEffect(() => {
		if (!paneReady || !gRef.current || !svgRef.current || LAKE_POLYGONS.length === 0) return;

		const g = gRef.current;
		while (g.firstChild) g.removeChild(g.firstChild);

		const rc = rough.svg(svgRef.current);

		for (const lake of LAKE_POLYGONS) {
			// Solid fill — no roughness on the fill itself
			g.appendChild(rc.path(lake.d, {
				roughness: 0,
				stroke: 'none',
				fill: '#C8CFCA',
				fillStyle: 'solid',
			}));
			// Hand-drawn outline
			g.appendChild(rc.path(lake.d, {
				roughness: 0.3,
				stroke: '#8AA898',
				strokeWidth: 0.8,
				fill: 'none',
				bowing: 0.3,
				disableMultiStroke: true,
			}));
		}
	}, [paneReady]);

	if (!paneReady || LAKE_POLYGONS.length === 0) return null;

	const bounds = L.latLngBounds(
		L.latLng(MAP_CONFIG.BOUNDS_SW[0], MAP_CONFIG.BOUNDS_SW[1]),
		L.latLng(MAP_CONFIG.BOUNDS_NE[0], MAP_CONFIG.BOUNDS_NE[1])
	);

	return (
		<SVGOverlay bounds={bounds} pane="lakePane" interactive={false}>
			<svg
				ref={svgRef}
				viewBox={`0 0 ${MAP_CONFIG.SVG_WIDTH} ${MAP_CONFIG.SVG_HEIGHT}`}
				preserveAspectRatio="none"
			>
				<g ref={gRef} />
			</svg>
		</SVGOverlay>
	);
};

export default LakesLayer;
```

**Step 2: Verify build**
```bash
npm run build 2>&1 | tail -10
```
Expected: clean build, no TypeScript errors.

**Step 3: Commit**
```bash
git add src/app/components/map/LakesLayer.tsx
git commit -m "feat(map): hand-drawn lake outlines via RoughJS"
```

---

### Task 4: City Labels — Remove Italic

**Files:**
- Modify: `src/app/components/map/CityLabels.tsx`

**Step 1: Remove fontStyle italic from non-capitals (line ~51)**

In `src/app/components/map/CityLabels.tsx`, find and remove `fontStyle="italic"` from the non-capital `<text>` element (the one with `fontSize="3"`).

**Step 2: Remove fontStyle italic from capitals (line ~68)**

In the same file, find and remove `fontStyle="italic"` from the capital `<text>` element (the one with `fontSize="5"`).

**Step 3: Verify build**
```bash
npm run build 2>&1 | tail -10
```
Expected: clean build.

**Step 4: Commit**
```bash
git add src/app/components/map/CityLabels.tsx
git commit -m "fix(map): remove italic from city and capital labels"
```

---

### Task 5: Label Deconfliction + City Clearance Zones

**Files:**
- Modify: `src/lib/label-config.ts`
- Create: `src/lib/__tests__/labelDeconflict.test.ts`

This adds automatic nudging so region labels don't overlap each other, and extends relief-icon clearance to include non-capital city labels.

**Step 1: Write failing tests**

Create `src/lib/__tests__/labelDeconflict.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { deconflictLabels } from '@/lib/label-config';
import type { LabelConfig } from '@/lib/label-config';

const base: Omit<LabelConfig, 'regionId' | 'name' | 'svgX' | 'svgY'> = {
	fontSize: 9, angle: 0, dx: 0, dy: 0,
};

describe('deconflictLabels', () => {
	it('leaves non-overlapping labels unchanged', () => {
		const labels: LabelConfig[] = [
			{ ...base, regionId: 'a', name: 'FOO', svgX: 100, svgY: 100 },
			{ ...base, regionId: 'b', name: 'BAR', svgX: 400, svgY: 400 },
		];
		const result = deconflictLabels(labels);
		expect(result.find(l => l.regionId === 'a')!.svgY).toBe(100);
		expect(result.find(l => l.regionId === 'b')!.svgY).toBe(400);
	});

	it('nudges overlapping labels apart in Y', () => {
		const labels: LabelConfig[] = [
			{ ...base, regionId: 'a', name: 'ALPHA', svgX: 100, svgY: 100 },
			{ ...base, regionId: 'b', name: 'BETA', svgX: 100, svgY: 103 },
		];
		const result = deconflictLabels(labels);
		const posA = result.find(l => l.regionId === 'a')!;
		const posB = result.find(l => l.regionId === 'b')!;
		// After deconfliction their Y centres should differ by more than one line height
		expect(Math.abs(posA.svgY - posB.svgY)).toBeGreaterThan(9 * 1.25);
	});

	it('preserves order of returned array', () => {
		const labels: LabelConfig[] = [
			{ ...base, regionId: 'a', name: 'FOO', svgX: 100, svgY: 100 },
			{ ...base, regionId: 'b', name: 'BAR', svgX: 100, svgY: 103 },
		];
		const result = deconflictLabels(labels);
		expect(result[0].regionId).toBe('a');
		expect(result[1].regionId).toBe('b');
	});

	it('larger fontSize label takes priority (stays closer to original position)', () => {
		const labels: LabelConfig[] = [
			{ ...base, regionId: 'small', name: 'TINY', svgX: 100, svgY: 100, fontSize: 6 },
			{ ...base, regionId: 'big', name: 'LARGE', svgX: 100, svgY: 103, fontSize: 9 },
		];
		const result = deconflictLabels(labels);
		const bigResult = result.find(l => l.regionId === 'big')!;
		// The big label should stay at its original position (it has priority)
		expect(bigResult.svgY).toBe(103);
	});
});
```

**Step 2: Run tests to verify they fail**
```bash
npx vitest run src/lib/__tests__/labelDeconflict.test.ts 2>&1 | tail -20
```
Expected: FAIL — `deconflictLabels` is not exported yet.

**Step 3: Implement deconflictLabels and city clearance extension**

In `src/lib/label-config.ts`:

a) Add `MAP_CITIES` to the import on line 1:
```typescript
import { MAP_REGIONS, MAP_CAPITALS, REGION_BOUNDARIES, MAP_CITIES } from '@/lib/map-data';
```

b) Add the `deconflictLabels` function before the "Exported constants" section (around line 190):
```typescript
// ---------------------------------------------------------------------------
// Automatic label deconfliction
// ---------------------------------------------------------------------------

export function deconflictLabels(configs: LabelConfig[]): LabelConfig[] {
	const CHAR_WIDTH_FACTOR = 0.52;
	const LINE_HEIGHT = 1.25;
	const PADDING = 3;

	interface Box { cx: number; cy: number; hw: number; hh: number }

	function getBox(label: LabelConfig, svgX: number, svgY: number): Box {
		const words = label.name.split(/\s+/);
		const maxWordLen = Math.max(...words.map((w) => w.length));
		const hw = (maxWordLen * label.fontSize * CHAR_WIDTH_FACTOR) / 2 + PADDING;
		const hh = (words.length * label.fontSize * LINE_HEIGHT) / 2 + PADDING;
		return { cx: svgX, cy: svgY, hw, hh };
	}

	function overlaps(a: Box, b: Box): boolean {
		return (
			Math.abs(a.cx - b.cx) < a.hw + b.hw &&
			Math.abs(a.cy - b.cy) < a.hh + b.hh
		);
	}

	// Sort by fontSize descending — larger labels take priority and stay put
	const sorted = [...configs].sort((a, b) => b.fontSize - a.fontSize);
	const placed: Array<{ id: string; box: Box }> = [];
	const adjustments = new Map<string, { svgX: number; svgY: number }>();

	for (const label of sorted) {
		let svgX = label.svgX;
		let svgY = label.svgY;

		for (let attempt = 0; attempt < 20; attempt++) {
			const box = getBox(label, svgX, svgY);
			const conflict = placed.find((p) => overlaps(box, p.box));
			if (!conflict) break;
			// Push away from conflict in Y
			const overlap = conflict.box.hh + box.hh - Math.abs(svgY - conflict.box.cy);
			svgY += svgY >= conflict.box.cy ? overlap : -overlap;
		}

		placed.push({ id: label.regionId, box: getBox(label, svgX, svgY) });
		adjustments.set(label.regionId, { svgX, svgY });
	}

	// Return in original order with adjusted positions
	return configs.map((c) => {
		const adj = adjustments.get(c.regionId);
		return adj ? { ...c, svgX: adj.svgX, svgY: adj.svgY } : c;
	});
}
```

c) In `computeClearanceZones`, add non-capital city zones after the existing capital zones block (before the closing `return zones;`):
```typescript
	// Non-capital city labels: text offset +2 from dot, fontSize 3
	for (const city of MAP_CITIES.filter((c) => !c.capital)) {
		const textWidth = city.name.length * 2.0;
		const textHeight = 3 * 1.2;
		zones.push({
			cx: city.svgX + 2 + textWidth / 2,
			cy: city.svgY,
			halfW: textWidth / 2 + padding,
			halfH: textHeight / 2 + padding,
			angle: 0,
		});
	}
```

d) Update the `LABEL_CONFIGS` export to run deconfliction:
```typescript
export const LABEL_CONFIGS = deconflictLabels(computeLabelConfigs());
```

**Step 4: Run tests to verify they pass**
```bash
npx vitest run src/lib/__tests__/labelDeconflict.test.ts 2>&1 | tail -20
```
Expected: 4 tests pass.

**Step 5: Run full test suite**
```bash
npx vitest run 2>&1 | tail -10
```
Expected: all 109 tests pass (105 existing + 4 new).

**Step 6: Verify build**
```bash
npm run build 2>&1 | tail -10
```
Expected: clean build.

**Step 7: Commit**
```bash
git add src/lib/label-config.ts src/lib/__tests__/labelDeconflict.test.ts
git commit -m "feat(map): automatic label deconfliction + extend relief clearance to city labels"
```

---

### Task 6: Stronger RoughJS on Borders

**Files:**
- Modify: `src/app/components/map/RoughBorders.tsx:48-55`

**Step 1: Increase roughness and bowing**

In `src/app/components/map/RoughBorders.tsx`, update the `opts` object (currently starting at line 48):
```typescript
const opts = {
	roughness: 0.5,
	strokeWidth: 0.9,
	bowing: 0.6,
	stroke: '#1a1a1a',
	fill: 'none',
	disableMultiStroke: true,
};
```
(Changed from `roughness: 0.35, bowing: 0.4`)

**Step 2: Verify build**
```bash
npm run build 2>&1 | tail -10
```
Expected: clean build.

**Step 3: Commit**
```bash
git add src/app/components/map/RoughBorders.tsx
git commit -m "feat(map): stronger hand-drawn border effect (roughness 0.5, bowing 0.6)"
```

---

### Task 7: Final Verification

**Step 1: Full test suite**
```bash
npx vitest run
```
Expected: all 109 tests pass.

**Step 2: Production build**
```bash
npm run build 2>&1 | tail -20
```
Expected: clean build, no TypeScript errors.

**Step 3: Dev smoke test**
```bash
npm run dev
```
Verify at http://localhost:3000/map:
- [ ] Ocean, land, and parchment page background all share the same warm tan tone
- [ ] Biome tints are very subtle — regions are distinguishable but barely
- [ ] Terrae Mortuae regions are visibly darker/murkier than surrounding land
- [ ] Ocean contour lines are bold near the coast, widely spaced further out
- [ ] Lake edges have a slightly wobbly hand-drawn look
- [ ] Region labels don't overlap each other (check crowded areas)
- [ ] City/capital labels are upright (no italic)
- [ ] Region borders look slightly more hand-drawn than before
- [ ] Zoom, pan, hover, click all still work
