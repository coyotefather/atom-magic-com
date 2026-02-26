# Map RoughJS + Ocean Polish Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add ocean labels, hand-drawn RoughJS wobble on ocean contours, and deeper parchment aging to match the hand-drawn reference map.

**Architecture:** Three independent visual layer changes — a new `OceanLabels` SVG overlay, a rewrite of `OceanContours` from react-leaflet GeoJSON to imperative RoughJS rendering, and a second turbulence pass in `GrainOverlay`. No data changes needed.

**Tech Stack:** React, react-leaflet SVGOverlay, roughjs, SVG filters (feTurbulence/feColorMatrix)

---

### Task 1: Ocean labels component

**Files:**
- Create: `src/app/components/map/OceanLabels.tsx`
- Modify: `src/app/components/map/SolumMap.tsx`

**Step 1: Create `OceanLabels.tsx`**

```tsx
'use client';

import { useState, useEffect } from 'react';
import { SVGOverlay, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MAP_CONFIG } from '@/lib/map-data';

const OCEAN_LABELS = [
	{ name: 'OCEANVS HIBERNIAE',  x: 590,  y: 165 },
	{ name: 'OCEANVS ALBIS',      x: 1330, y: 240 },
	{ name: 'OCEANVS CAMBRIAE',   x: 580,  y: 620 },
	{ name: 'OCEANVS MERIDIANVS', x: 1180, y: 680 },
] as const;

const OceanLabels = () => {
	const map = useMap();
	const [paneReady, setPaneReady] = useState(false);

	useEffect(() => {
		if (!map.getPane('oceanLabelsPane')) {
			map.createPane('oceanLabelsPane');
			map.getPane('oceanLabelsPane')!.style.zIndex = '155';
			map.getPane('oceanLabelsPane')!.style.pointerEvents = 'none';
		}
		setPaneReady(true);
	}, [map]);

	if (!paneReady) return null;

	const bounds = L.latLngBounds(
		L.latLng(MAP_CONFIG.BOUNDS_SW[0], MAP_CONFIG.BOUNDS_SW[1]),
		L.latLng(MAP_CONFIG.BOUNDS_NE[0], MAP_CONFIG.BOUNDS_NE[1])
	);

	return (
		<SVGOverlay bounds={bounds} pane="oceanLabelsPane" interactive={false}>
			<svg
				viewBox={`0 0 ${MAP_CONFIG.SVG_WIDTH} ${MAP_CONFIG.SVG_HEIGHT}`}
				preserveAspectRatio="none"
			>
				{OCEAN_LABELS.map((label) => (
					<text
						key={label.name}
						x={label.x}
						y={label.y}
						textAnchor="middle"
						dominantBaseline="central"
						fontFamily="'Noto Serif', serif"
						fontSize={20}
						fill="#6B5B3E"
						opacity={0.32}
						letterSpacing={2}
					>
						{label.name}
					</text>
				))}
			</svg>
		</SVGOverlay>
	);
};

export default OceanLabels;
```

**Step 2: Wire into `SolumMap.tsx`**

Add the import after the existing OceanContours import:
```tsx
import OceanLabels from './OceanLabels';
```

Add the component in the render, directly after `<OceanContours />`:
```tsx
<OceanContours />
<OceanLabels />
```

**Step 3: Verify build**

```bash
npm run build -- --webpack 2>&1 | tail -5
```
Expected: no errors.

**Step 4: Commit**

```bash
git add src/app/components/map/OceanLabels.tsx src/app/components/map/SolumMap.tsx
git commit -m "feat(map): add ocean labels (HIBERNIAE, ALBIS, CAMBRIAE, MERIDIANVS)"
```

---

### Task 2: RoughJS ocean contours

**Files:**
- Modify: `src/app/components/map/OceanContours.tsx`

The current implementation uses react-leaflet's `GeoJSON` component which renders perfectly smooth paths. Replace the entire file with an imperative RoughJS render (same pattern as `RoughBorders.tsx` and `LakesLayer.tsx`).

**Step 1: Replace `OceanContours.tsx` entirely**

```tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { SVGOverlay, useMap } from 'react-leaflet';
import L from 'leaflet';
import rough from 'roughjs';
import { MAP_CONFIG, OCEAN_CONTOURS } from '@/lib/map-data';

function ringToSvgPath(ring: number[][]): string {
	return ring.map((coord, i) => {
		const x = coord[0] * 32;
		const y = -coord[1] * 32;
		return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
	}).join(' ') + ' Z';
}

const CONTOUR_STYLES: Record<number, { weight: number; opacity: number }> = {
	1:  { weight: 2.0, opacity: 0.75 },
	2:  { weight: 1.6, opacity: 0.62 },
	3:  { weight: 1.3, opacity: 0.52 },
	4:  { weight: 1.1, opacity: 0.42 },
	5:  { weight: 0.9, opacity: 0.34 },
	6:  { weight: 0.8, opacity: 0.27 },
	7:  { weight: 0.7, opacity: 0.21 },
	8:  { weight: 0.6, opacity: 0.16 },
	9:  { weight: 0.55, opacity: 0.12 },
	10: { weight: 0.5,  opacity: 0.09 },
	11: { weight: 0.45, opacity: 0.06 },
	12: { weight: 0.4,  opacity: 0.04 },
};

const OceanContours = () => {
	const map = useMap();
	const [paneReady, setPaneReady] = useState(false);
	const gRef = useRef<SVGGElement>(null);
	const svgRef = useRef<SVGSVGElement>(null);

	useEffect(() => {
		if (!map.getPane('contourPane')) {
			map.createPane('contourPane');
			map.getPane('contourPane')!.style.zIndex = '150';
		}
		setPaneReady(true);
	}, [map]);

	useEffect(() => {
		if (!paneReady || !gRef.current || !svgRef.current) return;

		const g = gRef.current;
		while (g.firstChild) g.removeChild(g.firstChild);

		const rc = rough.svg(svgRef.current);

		for (const feature of OCEAN_CONTOURS.features) {
			const depth = (feature.properties?.depth as number) ?? 1;
			const style = CONTOUR_STYLES[depth] ?? CONTOUR_STYLES[1];
			const opts = {
				roughness: 0.25,
				bowing: 0.4,
				strokeWidth: style.weight,
				stroke: '#6B5B3E',
				fill: 'none',
				disableMultiStroke: true,
			};

			const drawRing = (ring: number[][]) => {
				const el = rc.path(ringToSvgPath(ring), opts);
				el.setAttribute('opacity', String(style.opacity));
				g.appendChild(el);
			};

			const geom = feature.geometry;
			if (geom.type === 'Polygon') {
				drawRing(geom.coordinates[0] as number[][]);
			} else if (geom.type === 'MultiPolygon') {
				for (const polygon of geom.coordinates as number[][][][]) {
					drawRing(polygon[0]);
				}
			}
		}
	}, [paneReady]);

	if (!paneReady || OCEAN_CONTOURS.features.length === 0) return null;

	const bounds = L.latLngBounds(
		L.latLng(MAP_CONFIG.BOUNDS_SW[0], MAP_CONFIG.BOUNDS_SW[1]),
		L.latLng(MAP_CONFIG.BOUNDS_NE[0], MAP_CONFIG.BOUNDS_NE[1])
	);

	return (
		<SVGOverlay bounds={bounds} pane="contourPane" interactive={false}>
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

export default OceanContours;
```

**Step 2: Verify build**

```bash
npm run build -- --webpack 2>&1 | tail -5
```
Expected: no errors.

**Step 3: Commit**

```bash
git add src/app/components/map/OceanContours.tsx
git commit -m "feat(map): ocean contours via RoughJS (roughness 0.25, bowing 0.4)"
```

---

### Task 3: Enhanced parchment aging

**Files:**
- Modify: `src/app/components/map/GrainOverlay.tsx`

Add a second, large-scale turbulence layer that creates soft blotch stains, as visible in the hand-drawn reference.

**Step 1: Update the JSX in `GrainOverlay.tsx`**

Replace the `<defs>…</defs>` and single `<rect>` with two filters and two rects:

```tsx
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
	<filter id="paper-blotch">
		<feTurbulence
			type="fractalNoise"
			baseFrequency="0.025 0.025"
			numOctaves={2}
			seed={7}
			result="noise"
		/>
		<feColorMatrix
			type="matrix"
			values="0 0 0 0 0.35  0 0 0 0 0.30  0 0 0 0 0.20  0 0 0 0.07 0"
			in="noise"
		/>
	</filter>
</defs>
<rect
	width={MAP_CONFIG.SVG_WIDTH}
	height={MAP_CONFIG.SVG_HEIGHT}
	filter="url(#paper-blotch)"
/>
<rect
	width={MAP_CONFIG.SVG_WIDTH}
	height={MAP_CONFIG.SVG_HEIGHT}
	filter="url(#paper-grain)"
/>
```

**Step 2: Verify build**

```bash
npm run build -- --webpack 2>&1 | tail -5
```
Expected: no errors.

**Step 3: Commit**

```bash
git add src/app/components/map/GrainOverlay.tsx
git commit -m "feat(map): add large-scale parchment blotch layer to GrainOverlay"
```

---

### Task 4: Final verification

**Step 1: Run full test suite**

```bash
npx vitest run
```
Expected: all 109 tests pass.

**Step 2: Production build**

```bash
npm run build -- --webpack 2>&1 | tail -5
```
Expected: clean, no errors.

**Step 3: Dev smoke test**

```bash
npm run dev
```

Open `http://localhost:3000/map` and verify:
- [ ] Ocean labels visible in open water at low opacity
- [ ] Ocean contours have slight hand-drawn wobble (visible especially on inner/bolder rings)
- [ ] Parchment blotch stains visible as soft large patches across the map
- [ ] No visual regressions on borders, lakes, relief icons, rivers, region labels
- [ ] Map interaction (hover, click, zoom) still works normally
