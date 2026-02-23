# Map Label & City Polish — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Six visual polish changes to the Solum map: biome opacity, Terrae Mortuae dead-tree override, label stroke removal, no rotation, word-per-row labels, and all cities shown (capitals always, non-capitals at max zoom).

**Architecture:** All changes are to existing SVG-overlay components and the `generate-tiles.mjs` build script. No new data flows. CityLabels replaces CapitalMarkers; the build script gains `extractCities()`.

**Tech Stack:** React, react-leaflet SVGOverlay, Leaflet useMap/useMapEvent, TypeScript, Node.js (build script)

---

### Task 1: Biome fill opacity → 50%

**Files:**
- Modify: `src/app/components/map/BiomeFillLayer.tsx:82-90`

**Step 1: Apply opacity**

In both the `Polygon` and `MultiPolygon` branches, add `fillOpacity={0.5}`:

```tsx
// Polygon branch (line ~83)
return <path key={i} d={d} fill={fill} fillOpacity={0.5} stroke="none" />;

// MultiPolygon branch (line ~89)
return <path key={i} d={d} fill={fill} fillOpacity={0.5} stroke="none" />;
```

**Step 2: Verify visually**

Run `npm run dev`, open `/map`. Biome colours should be 50% translucent, letting the parchment show through beneath.

**Step 3: Commit**

```bash
git add src/app/components/map/BiomeFillLayer.tsx
git commit -m "chore(map): reduce biome fill opacity to 50%"
```

---

### Task 2: Remove stroke from region and capital labels; make capitals uppercase

**Files:**
- Modify: `src/app/components/map/RegionLabels.tsx:41-60`
- Modify: `src/app/components/map/CapitalMarkers.tsx:35-50`

**Step 1: Update RegionLabels — remove stroke attributes**

Remove these four props from the `<text>` element:
- `paintOrder="stroke fill"`
- `stroke="#F5F3ED"`
- `strokeWidth="3"`
- `strokeLinejoin="round"`

The `style={{ textTransform: 'uppercase' as const }}` is already there — leave it.

**Step 2: Update CapitalMarkers — remove stroke, add uppercase**

Remove from the `<text>` element:
- `paintOrder="stroke fill"`
- `stroke="#F5F3ED"`
- `strokeWidth="2"`
- `strokeLinejoin="round"`

Add:
```tsx
style={{ textTransform: 'uppercase' as const }}
```

**Step 3: Commit**

```bash
git add src/app/components/map/RegionLabels.tsx src/app/components/map/CapitalMarkers.tsx
git commit -m "chore(map): remove stroke from labels, make capitals uppercase"
```

---

### Task 3: Remove rotation from region labels

**Files:**
- Modify: `src/app/components/map/RegionLabels.tsx`

**Step 1: Remove the transform attribute**

Delete the `transform` prop from `<text>`:
```tsx
// Remove this line entirely:
transform={label.angle ? `rotate(${label.angle}, ${label.svgX}, ${label.svgY})` : undefined}
```

The angles remain in `LABEL_OVERRIDES` / `LABEL_CONFIGS` (still used for relief clearance zone geometry) but are no longer applied visually.

**Step 2: Commit**

```bash
git add src/app/components/map/RegionLabels.tsx
git commit -m "chore(map): remove rotation from region labels"
```

---

### Task 4: Multi-word region labels — one word per row

**Files:**
- Modify: `src/app/components/map/RegionLabels.tsx`

**Step 1: Replace single `<text>` with word-stacked tspans**

Replace the existing `<text>` block with:

```tsx
{visibleLabels.map((label) => {
    const words = label.name.split(/\s+/);
    const lineHeight = label.fontSize * 1.25;
    const yStart = label.svgY - ((words.length - 1) * lineHeight) / 2;

    return (
        <text
            key={label.regionId}
            x={label.svgX}
            y={yStart}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="'Marcellus', serif"
            fontSize={label.fontSize}
            fill="#8B2500"
            letterSpacing="0.2em"
            style={{ textTransform: 'uppercase' as const }}
        >
            {words.map((word, i) => (
                <tspan key={i} x={label.svgX} dy={i === 0 ? 0 : lineHeight}>
                    {word}
                </tspan>
            ))}
        </text>
    );
})}
```

Single-word labels render identically to before (`words.length === 1` → `yStart === label.svgY`, single tspan with `dy=0`).

**Step 2: Verify**

Check `/map` — multi-word region names (e.g. "Cassis Minor", "Western Terrae Mortuae") should stack vertically, centred on the same point as before.

**Step 3: Commit**

```bash
git add src/app/components/map/RegionLabels.tsx
git commit -m "chore(map): stack multi-word region labels one word per row"
```

---

### Task 5: Terrae Mortuae — override tree icons to dead trees

**Files:**
- Modify: `src/app/components/map/ReliefLayer.tsx`

**Background:** The two Terrae Mortuae regions are `state-4` (Western) and `state-5` (Eastern). Any relief placement whose icon type maps to a live tree (`tree-a`, `tree-b`, `tree-c`, `tree-d`) should display `tree-e` (dead trees) if the placement centre falls inside either region polygon. Hills and grass are unchanged.

**Step 1: Add imports and precompute TM polygon rings**

At the top of `ReliefLayer.tsx`, after existing imports, add:

```tsx
import { REGION_BOUNDARIES } from '@/lib/map-data';
```

After `clearanceZones` is defined, add:

```tsx
/** Ray-cast point-in-polygon test. Polygon is an array of [svgX, svgY] pairs. */
function pointInPolygon(px: number, py: number, poly: number[][]): boolean {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const xi = poly[i][0], yi = poly[i][1];
        const xj = poly[j][0], yj = poly[j][1];
        if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
            inside = !inside;
        }
    }
    return inside;
}

/** Terrae Mortuae polygon rings in SVG coordinate space.
 *  GeoJSON coords are [lng, lat]; SVG = (lng*32, -lat*32).
 */
const TM_REGION_IDS = new Set(['state-4', 'state-5']);
const TM_POLYGONS: number[][][] = [];
for (const feature of REGION_BOUNDARIES.features) {
    if (!TM_REGION_IDS.has(feature.properties?.regionId)) continue;
    const rings =
        feature.geometry.type === 'Polygon'
            ? [feature.geometry.coordinates[0] as number[][]]
            : (feature.geometry.coordinates as number[][][][]).map((p) => p[0]);
    for (const ring of rings) {
        TM_POLYGONS.push(ring.map(([lng, lat]) => [lng * 32, -lat * 32]));
    }
}

function isInTerraeMoretuae(svgX: number, svgY: number): boolean {
    return TM_POLYGONS.some((poly) => pointInPolygon(svgX, svgY, poly));
}
```

**Step 2: Apply TM override in visiblePlacements**

The types to override are live tree types. In the final `.map()` of `visiblePlacements`, after the existing `customType` remapping block, add:

```tsx
// Override to dead trees inside Terrae Mortuae
const LIVE_TREE_TYPES = new Set(['tree-a', 'tree-b', 'tree-c', 'tree-d']);
if (customType && LIVE_TREE_TYPES.has(customType)) {
    const cx2 = cx - newW / 2 + newW / 2; // === cx, just clarity
    if (isInTerraeMoretuae(cx, cy)) {
        href = `custom-tree-e-${Math.floor(posHash(p.x, p.y) * 3) + 1}`;
    }
}
```

Actually, write it cleanly — replace the existing href block entirely:

```tsx
const customType = AZGAAR_TO_CUSTOM[p.type];
let href = p.href;
if (customType) {
    const variantIdx = Math.floor(posHash(p.x, p.y) * 3) + 1;
    const LIVE_TREE_CUSTOM_TYPES = new Set(['tree-a', 'tree-b', 'tree-c', 'tree-d']);
    const effectiveType =
        LIVE_TREE_CUSTOM_TYPES.has(customType) && isInTerraeMoretuae(cx, cy)
            ? 'tree-e'
            : customType;
    href = `custom-${effectiveType}-${variantIdx}`;
}
```

**Step 3: TypeScript build check**

```bash
npm run build -- --webpack 2>&1 | grep -E "error TS|ReliefLayer"
```

Expected: no errors.

**Step 4: Verify visually**

On `/map`, zoom into the two Terrae Mortuae regions (dark-filled areas). Conifer/deciduous icons should be replaced by the hand-drawn dead tree icons.

**Step 5: Commit**

```bash
git add src/app/components/map/ReliefLayer.tsx
git commit -m "feat(map): override tree icons to dead trees in Terrae Mortuae regions"
```

---

### Task 6: Extract all cities from .map file

**Files:**
- Modify: `scripts/generate-tiles.mjs`
- Modify: `src/lib/map-data.ts` (regenerated — do not hand-edit)

**Step 1: Add `extractCities()` to generate-tiles.mjs**

Insert after `extractCapitals()` (around line 536):

```js
// ---------------------------------------------------------------------------
// 3b. Extract all cities (non-capital burgs) from Azgaar burg data
// ---------------------------------------------------------------------------

function extractCities(mapData) {
    console.log('\n=== City Extraction ===');
    const { lines, burgsLineIdx } = mapData;
    const burgsData = JSON.parse(lines[burgsLineIdx]);
    const cities = [];

    for (const burg of burgsData) {
        if (!burg.name || burg.removed) continue;
        cities.push({
            i: burg.i,
            name: burg.name,
            svgX: Math.round(burg.x * 100) / 100,
            svgY: Math.round(burg.y * 100) / 100,
            stateId: burg.state,
            capital: burg.capital === 1,
        });
    }

    console.log('Found ' + cities.length + ' cities (' +
        cities.filter(c => c.capital).length + ' capitals, ' +
        cities.filter(c => !c.capital).length + ' non-capitals)');
    return cities;
}
```

Note: `svgX`/`svgY` are stored directly in SVG pixel space (0–1438, 0–755) — no lat/lng conversion needed since `CityLabels.tsx` renders within `SVGOverlay` using the same coordinate space.

**Step 2: Thread cities through `main()` and `writeMapData()`**

In `main()`, after `const capitals = extractCapitals(mapData);`:
```js
const cities = extractCities(mapData);
```

Update the `writeMapData` call:
```js
writeMapData({ ...data, capitals, cities, biomeLegend, regionBiomes, oceanContours, svgW, svgH });
```

**Step 3: Add `MapCity` interface and `MAP_CITIES` export in `writeMapData()`**

In `writeMapData({ regions, geojson, capitals, cities, ... })`, add the interface and export to the `ts` array:

After the `MapCapital` interface block, add:
```js
'',
'export interface MapCity {',
'\ti: number;',
'\tname: string;',
'\tsvgX: number;',
'\tsvgY: number;',
'\tstateId: number;',
'\tcapital: boolean;',
'}',
```

After the `MAP_CAPITALS` export, add:
```js
'',
'/**',
' * All cities (capitals + non-capitals) extracted from Azgaar burg data.',
' */',
'export const MAP_CITIES: MapCity[] = ' + JSON.stringify(cities) + ';',
```

**Step 4: Run the build script**

```bash
node scripts/generate-tiles.mjs mapfiles/SOLUM-PR.map
```

Expected output includes:
```
=== City Extraction ===
Found 394 cities (15 capitals, 379 non-capitals)
```

Verify `src/lib/map-data.ts` now contains `export const MAP_CITIES: MapCity[] = [...]`.

**Step 5: Commit**

```bash
git add scripts/generate-tiles.mjs src/lib/map-data.ts
git commit -m "feat(map): extract all cities from .map file, add MAP_CITIES to map-data"
```

---

### Task 7: Create CityLabels component + wire into SolumMap

**Files:**
- Create: `src/app/components/map/CityLabels.tsx`
- Modify: `src/app/components/map/SolumMap.tsx`
- Delete: `src/app/components/map/CapitalMarkers.tsx`

**Step 1: Create `CityLabels.tsx`**

```tsx
'use client';

import { useState, useEffect } from 'react';
import { SVGOverlay, useMap, useMapEvent } from 'react-leaflet';
import L from 'leaflet';
import { MAP_CONFIG, MAP_CITIES } from '@/lib/map-data';

const bounds = L.latLngBounds(
    L.latLng(MAP_CONFIG.BOUNDS_SW[0], MAP_CONFIG.BOUNDS_SW[1]),
    L.latLng(MAP_CONFIG.BOUNDS_NE[0], MAP_CONFIG.BOUNDS_NE[1])
);

const capitals = MAP_CITIES.filter((c) => c.capital);
const nonCapitals = MAP_CITIES.filter((c) => !c.capital);

const CityLabels = () => {
    const map = useMap();
    const [paneReady, setPaneReady] = useState(false);
    const [zoom, setZoom] = useState(() => map.getZoom());

    useEffect(() => {
        if (!map.getPane('capitalLabelsPane')) {
            map.createPane('capitalLabelsPane');
            map.getPane('capitalLabelsPane')!.style.zIndex = '520';
            map.getPane('capitalLabelsPane')!.style.pointerEvents = 'none';
        }
        setPaneReady(true);
    }, [map]);

    useMapEvent('zoomend', () => setZoom(map.getZoom()));

    if (!paneReady) return null;

    const showNonCapitals = zoom >= MAP_CONFIG.MAX_ZOOM;

    return (
        <SVGOverlay bounds={bounds} pane="capitalLabelsPane" interactive={false}>
            <svg viewBox={`0 0 ${MAP_CONFIG.SVG_WIDTH} ${MAP_CONFIG.SVG_HEIGHT}`} preserveAspectRatio="none">
                {/* Non-capitals — max zoom only */}
                {showNonCapitals && nonCapitals.map((city) => (
                    <g key={city.i}>
                        <circle cx={city.svgX} cy={city.svgY} r="0.8" fill="#1a1a1a" />
                        <text
                            x={city.svgX + 2}
                            y={city.svgY}
                            dominantBaseline="central"
                            fontFamily="'Noto Serif', serif"
                            fontStyle="italic"
                            fontSize="3"
                            fill="#1a1a1a"
                            style={{ textTransform: 'uppercase' as const }}
                        >
                            {city.name}
                        </text>
                    </g>
                ))}
                {/* Capitals — always visible */}
                {capitals.map((city) => (
                    <g key={city.i}>
                        <circle cx={city.svgX} cy={city.svgY} r="1.5" fill="#1a1a1a" />
                        <text
                            x={city.svgX + 3}
                            y={city.svgY}
                            dominantBaseline="central"
                            fontFamily="'Noto Serif', serif"
                            fontStyle="italic"
                            fontSize="5"
                            fill="#1a1a1a"
                            style={{ textTransform: 'uppercase' as const }}
                        >
                            {city.name}
                        </text>
                    </g>
                ))}
            </svg>
        </SVGOverlay>
    );
};

export default CityLabels;
```

**Step 2: Update SolumMap.tsx**

Replace:
```tsx
import CapitalMarkers from './CapitalMarkers';
```
With:
```tsx
import CityLabels from './CityLabels';
```

Replace `<CapitalMarkers />` with `<CityLabels />` in the JSX.

**Step 3: Delete old component**

```bash
rm src/app/components/map/CapitalMarkers.tsx
```

**Step 4: TypeScript build check**

```bash
npm run build -- --webpack 2>&1 | grep -E "error TS|CityLabels|CapitalMarkers"
```

Expected: no errors, no references to CapitalMarkers.

**Step 5: Verify visually**

- At default zoom: only capital dots + names visible
- Zoom to max (level 5): non-capital city dots and names appear
- All labels uppercase

**Step 6: Commit**

```bash
git add src/app/components/map/CityLabels.tsx src/app/components/map/SolumMap.tsx
git rm src/app/components/map/CapitalMarkers.tsx
git commit -m "feat(map): add all city labels (capitals always, non-capitals at max zoom)"
```

---

### Task 8: Run full test suite + verify build

**Step 1: Run tests**

```bash
npm test
```

Expected: all tests pass (map components don't have unit tests; the test suite covers game logic, character manager, utilities).

**Step 2: Production build**

```bash
npm run build -- --webpack 2>&1 | tail -10
```

Expected: compiled successfully, no errors.

**Step 3: Final visual check on `/map`**

- Biome fills at 50% opacity
- Terrae Mortuae regions show dead-tree icons for forested terrain
- Region labels: no stroke, no rotation, stacked one word per row
- Capitals always visible, uppercase, no stroke
- Non-capital cities appear only at max zoom
