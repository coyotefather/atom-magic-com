# Tolkien Map Enhancements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Bring the interactive map closer to Tolkien's 1954 Middle-earth style through composite terrain silhouettes, coastline echo lines, label clearance zones, and rotated region labels.

**Architecture:** Build-time data generation in `scripts/generate-tiles.mjs` produces terrain clusters, outward ocean contours, and label angle data. Components render the pre-computed data. A shared label config module enables both `RegionLabels.tsx` and `ReliefLayer.tsx` to know label positions for rendering and clearance.

**Tech Stack:** Node.js build script, React + react-leaflet SVGOverlay, Leaflet CRS.Simple, SVG `<path>`/`<text>`/`<textPath>` elements.

---

### Task 1: Create Shared Label Config Module

**Files:**
- Create: `src/lib/label-config.ts`
- Modify: `src/app/components/map/RegionLabels.tsx`

**Step 1: Create `src/lib/label-config.ts`**

This module computes label positions from region boundary data and holds per-region overrides for angle, offset, and font size. Both `RegionLabels.tsx` and `ReliefLayer.tsx` will import from here.

```typescript
import { MAP_REGIONS, MAP_CAPITALS, REGION_BOUNDARIES, MAP_CONFIG } from '@/lib/map-data';
import type { Position } from 'geojson';

const DIVISOR = 32; // 2^maxZoom

export interface LabelConfig {
  regionId: string;
  name: string;
  svgX: number;
  svgY: number;
  angle: number;      // degrees rotation
  dx: number;          // offset from centroid in SVG units
  dy: number;
  fontSize: number;
}

export interface CapitalConfig {
  id: number;
  name: string;
  svgX: number;
  svgY: number;
}

// Per-region overrides: angle (degrees), dx/dy offset from centroid, fontSize
// Positive angle = clockwise rotation. Values tuned by visual inspection.
const LABEL_OVERRIDES: Record<string, Partial<Pick<LabelConfig, 'angle' | 'dx' | 'dy' | 'fontSize'>>> = {
  'state-1':  { angle: 0 },       // Soli Minor (Usum-Kur)
  'state-2':  { angle: 0 },       // Austellus
  'state-3':  { angle: 0 },       // Cassis Minor
  'state-4':  { angle: -20 },     // Western Terrae Mortuae
  'state-5':  { angle: -15 },     // Eastern Terrae Mortuae
  'state-8':  { angle: 0 },       // Cassis Major
  'state-9':  { angle: 10 },      // Terrae Liberae
  'state-10': { angle: 0 },       // Circeii
  'state-11': { angle: -30 },     // Praesidium
  'state-12': { angle: -45 },     // Isospora
  'state-13': { angle: 0 },       // Aetos
  'state-14': { angle: 15 },      // Hesperia
  'state-15': { angle: 0 },       // Aquilo
  'state-16': { angle: 0 },       // Aquilo Novus
  'state-17': { angle: 0 },       // Insula Palmaris
};

function centroid(ring: Position[]): [number, number] {
  let sumLng = 0;
  let sumLat = 0;
  const count = ring.length > 1
    && ring[0][0] === ring[ring.length - 1][0]
    && ring[0][1] === ring[ring.length - 1][1]
    ? ring.length - 1
    : ring.length;
  for (let i = 0; i < count; i++) {
    sumLng += ring[i][0];
    sumLat += ring[i][1];
  }
  return [sumLat / count, sumLng / count];
}

function largestRingCentroid(coordinates: Position[][][]): [number, number] {
  let largest = coordinates[0][0];
  let maxLen = largest.length;
  for (let i = 1; i < coordinates.length; i++) {
    if (coordinates[i][0].length > maxLen) {
      largest = coordinates[i][0];
      maxLen = largest.length;
    }
  }
  return centroid(largest);
}

function computeLabelConfigs(): LabelConfig[] {
  const regionMap = new Map(MAP_REGIONS.map((r) => [r.id, r]));
  const labels: LabelConfig[] = [];

  for (const feature of REGION_BOUNDARIES.features) {
    const regionId = feature.properties?.regionId;
    const region = regionId ? regionMap.get(regionId) : undefined;
    if (!region) continue;

    let position: [number, number];
    if (feature.geometry.type === 'Polygon') {
      position = centroid(feature.geometry.coordinates[0] as Position[]);
    } else if (feature.geometry.type === 'MultiPolygon') {
      position = largestRingCentroid(feature.geometry.coordinates as Position[][][]);
    } else {
      continue;
    }

    const [lat, lng] = position;
    const overrides = LABEL_OVERRIDES[region.id] ?? {};
    labels.push({
      regionId: region.id,
      name: region.name,
      svgX: lng * DIVISOR + (overrides.dx ?? 0),
      svgY: -lat * DIVISOR + (overrides.dy ?? 0),
      angle: overrides.angle ?? 0,
      dx: overrides.dx ?? 0,
      dy: overrides.dy ?? 0,
      fontSize: overrides.fontSize ?? 9,
    });
  }
  return labels;
}

function computeCapitalConfigs(): CapitalConfig[] {
  return MAP_CAPITALS.map((c) => ({
    id: c.id,
    name: c.name,
    svgX: c.lng * DIVISOR,
    svgY: -c.lat * DIVISOR,
  }));
}

export const LABEL_CONFIGS = computeLabelConfigs();
export const CAPITAL_CONFIGS = computeCapitalConfigs();

/** SVG bounding box for a label, accounting for rotation. Used for clearance zones. */
export interface LabelBBox {
  cx: number; cy: number;       // center
  halfW: number; halfH: number; // half-width/height before rotation
  angle: number;                // rotation in degrees
}

/** Approximate bounding boxes for all labels (region + capital). */
export function computeClearanceZones(padding = 12): LabelBBox[] {
  const zones: LabelBBox[] = [];

  for (const label of LABEL_CONFIGS) {
    // Approximate text width: ~5.5px per character at fontSize 9 with letter-spacing
    const textWidth = label.name.length * 5.5;
    zones.push({
      cx: label.svgX,
      cy: label.svgY,
      halfW: textWidth / 2 + padding,
      halfH: label.fontSize / 2 + padding,
      angle: label.angle,
    });
  }

  for (const cap of CAPITAL_CONFIGS) {
    const textWidth = cap.name.length * 3.5; // smaller font
    zones.push({
      cx: cap.svgX + 3 + textWidth / 2, // offset right of dot
      cy: cap.svgY,
      halfW: textWidth / 2 + padding * 0.6,
      halfH: 5 + padding * 0.6,
      angle: 0,
    });
  }

  return zones;
}
```

**Step 2: Refactor `RegionLabels.tsx` to use shared config**

Remove the inline centroid computation and `LabelData` interface. Import `LABEL_CONFIGS` from `label-config.ts`. Apply rotation via SVG `transform` attribute on each `<text>` element.

```typescript
// Replace the imports and remove centroid/largestRingCentroid/computeLabels functions.
// Import LABEL_CONFIGS instead.

import { LABEL_CONFIGS } from '@/lib/label-config';

// In the render, replace visibleLabels computation:
const visibleLabels = focusedRegionId
  ? LABEL_CONFIGS.filter((l) => l.regionId === focusedRegionId)
  : LABEL_CONFIGS;

// On each <text>, add transform for rotation:
<text
  key={label.regionId}
  x={label.svgX}
  y={label.svgY}
  textAnchor="middle"
  dominantBaseline="central"
  fontFamily="'Marcellus', serif"
  fontSize={label.fontSize}
  fill="#8B2500"
  letterSpacing="0.2em"
  paintOrder="stroke fill"
  stroke="#F5F3ED"
  strokeWidth="3"
  strokeLinejoin="round"
  transform={label.angle ? `rotate(${label.angle}, ${label.svgX}, ${label.svgY})` : undefined}
  style={{ textTransform: 'uppercase' as const }}
>
  {label.name}
</text>
```

**Step 3: Refactor `CapitalMarkers.tsx` to use shared config**

Import `CAPITAL_CONFIGS` from `label-config.ts`. Remove the inline coordinate computation.

**Step 4: Verify build**

Run: `npm run build -- --webpack`
Expected: Clean build, no TypeScript errors.

**Step 5: Visually verify and tune angles**

Run: `npm run dev`, navigate to `/map`, inspect label rotations. Adjust `LABEL_OVERRIDES` angles as needed by visual inspection of each region's shape.

**Step 6: Commit**

```bash
git add src/lib/label-config.ts src/app/components/map/RegionLabels.tsx src/app/components/map/CapitalMarkers.tsx
git commit -m "Add shared label config with per-region rotation angles"
```

---

### Task 2: Add Outward Coastline Echo Lines

**Files:**
- Modify: `scripts/generate-tiles.mjs` (lines 587-711, `generateOceanContours`)
- Modify: `src/app/components/map/OceanContours.tsx`
- Regenerate: `src/lib/map-data.ts`

**Step 1: Extend `generateOceanContours` to produce outward contours**

In `scripts/generate-tiles.mjs`, after the existing inward contour loop (line 678-711), add a second loop that generates 3 outward contours. The key difference: negate the offset distance so `offsetRing` pushes outward instead of inward. Add a `direction` property to distinguish them.

```javascript
// After the existing for-loop that generates inward contours (around line 711):

// Outward coastline echo lines (into the ocean)
const OUTWARD_OFFSETS = [0.008, 0.018, 0.03];
for (let i = 0; i < OUTWARD_OFFSETS.length; i++) {
  const distance = -OUTWARD_OFFSETS[i]; // negative = outward
  const contourLines = [];

  for (const feature of geojson.features) {
    let rings;
    if (feature.geometry.type === 'Polygon') {
      rings = [feature.geometry.coordinates[0]];
    } else if (feature.geometry.type === 'MultiPolygon') {
      rings = feature.geometry.coordinates.map((p) => p[0]);
    } else {
      continue;
    }

    for (const ring of rings) {
      if (ring.length < 4) continue;
      const offset = offsetRing(ring, distance);
      if (offset && offset.length >= 4) {
        contourLines.push(offset);
      }
    }
  }

  if (contourLines.length > 0) {
    features.push({
      type: 'Feature',
      properties: { depth: -(i + 1), direction: 'outward' },
      geometry: {
        type: 'MultiLineString',
        coordinates: contourLines,
      },
    });
    const totalVerts = contourLines.reduce((sum, l) => sum + l.length, 0);
    console.log('  Outward ' + (i + 1) + ' (offset ' + OUTWARD_OFFSETS[i] + '): '
      + contourLines.length + ' contours, ' + totalVerts + ' vertices');
  }
}
```

**Step 2: Regenerate map data**

Run: `node scripts/generate-tiles.mjs mapfiles/SOLUM-PR.map`
Expected: Console shows 3 outward contour levels in addition to existing 8 inward.

**Step 3: Update `OceanContours.tsx` to style outward contours**

Add styles for the outward contours (negative depth values). These should be solid lines (no dashArray), thin, with moderate opacity.

```typescript
// Add outward contour styles (keyed by negative depth):
const OUTWARD_STYLES: Record<number, L.PathOptions> = {
  '-1': { color: '#1a1a1a', weight: 0.9, opacity: 0.30 },
  '-2': { color: '#1a1a1a', weight: 0.7, opacity: 0.22 },
  '-3': { color: '#1a1a1a', weight: 0.5, opacity: 0.15 },
};

// In the style callback, check depth sign:
style={(feature: Feature | undefined) => {
  const depth = (feature?.properties?.depth as number) ?? 1;
  const baseStyle = depth < 0
    ? (OUTWARD_STYLES[depth] ?? OUTWARD_STYLES[-1])
    : (CONTOUR_STYLES[depth] ?? CONTOUR_STYLES[1]);
  return { ...baseStyle, fill: false, interactive: false };
}}
```

**Step 4: Verify build**

Run: `npm run build -- --webpack`
Expected: Clean build.

**Step 5: Visually verify**

Run: `npm run dev`, check that 3 solid lines appear in the ocean hugging the coastline, separate from the existing dashed inward contours.

**Step 6: Commit**

```bash
git add scripts/generate-tiles.mjs src/lib/map-data.ts src/app/components/map/OceanContours.tsx
git commit -m "Add outward coastline echo lines in the ocean"
```

---

### Task 3: Composite Terrain — Build Script Clustering

**Files:**
- Modify: `scripts/generate-tiles.mjs` (add clustering + composite path generation functions)
- Create: `src/lib/terrain-data.ts` (generated)

This is the largest task. The build script needs new functions for:
1. Clustering placements by proximity
2. Generating mountain ridgeline SVG paths from clusters
3. Generating forest canopy outline SVG paths from clusters
4. Writing the terrain data file

**Step 1: Add clustering function to build script**

After `extractRelief` (line 467), add a `clusterPlacements` function:

```javascript
function clusterPlacements(placements, maxDistance = 40) {
  const used = new Set();
  const clusters = [];

  for (let i = 0; i < placements.length; i++) {
    if (used.has(i)) continue;
    const cluster = [placements[i]];
    used.add(i);

    // Grow cluster by adding nearby points
    let changed = true;
    while (changed) {
      changed = false;
      for (let j = 0; j < placements.length; j++) {
        if (used.has(j)) continue;
        for (const cp of cluster) {
          const dx = placements[j].x + placements[j].w / 2 - (cp.x + cp.w / 2);
          const dy = placements[j].y + placements[j].h / 2 - (cp.y + cp.h / 2);
          if (Math.sqrt(dx * dx + dy * dy) < maxDistance) {
            cluster.push(placements[j]);
            used.add(j);
            changed = true;
            break;
          }
        }
      }
    }
    clusters.push(cluster);
  }
  return clusters;
}
```

**Step 2: Add mountain ridgeline generator**

```javascript
function generateMountainRidgeline(cluster) {
  // Sort points left-to-right by x center
  const sorted = cluster
    .map(p => ({ cx: p.x + p.w / 2, cy: p.y + p.h / 2, size: p.w }))
    .sort((a, b) => a.cx - b.cx);

  // Find the top edge (minimum y = highest visually) of the cluster
  const minY = Math.min(...sorted.map(p => p.cy - p.size * 0.5));
  const maxY = Math.max(...sorted.map(p => p.cy + p.size * 0.3));
  const baseY = maxY + 2; // baseline below all peaks

  // Generate peaks along the ridge
  let d = `M ${sorted[0].cx - sorted[0].size * 0.6},${baseY}`;
  for (const p of sorted) {
    const peakH = p.size * 0.8; // taller peaks for larger placements
    const peakTop = p.cy - peakH * 0.5;
    const halfW = p.size * 0.35;
    d += ` L ${p.cx - halfW},${baseY}`;
    d += ` L ${p.cx},${peakTop}`;
    d += ` L ${p.cx + halfW},${baseY}`;
  }
  d += ` L ${sorted[sorted.length - 1].cx + sorted[sorted.length - 1].size * 0.6},${baseY}`;

  // Generate hatching lines on the right side of each peak
  const hatching = [];
  for (const p of sorted) {
    const peakTop = p.cy - p.size * 0.8 * 0.5;
    const halfW = p.size * 0.35;
    // 2-3 hatching lines per peak
    for (let h = 0; h < 3; h++) {
      const t = 0.3 + h * 0.25; // fraction down from peak
      const y1 = peakTop + (baseY - peakTop) * t * 0.6;
      const y2 = peakTop + (baseY - peakTop) * (t + 0.15);
      const x1 = p.cx + halfW * t * 0.4;
      const x2 = p.cx + halfW * (t + 0.3);
      hatching.push(`M ${x1.toFixed(1)},${y1.toFixed(1)} L ${x2.toFixed(1)},${y2.toFixed(1)}`);
    }
  }

  return {
    outline: d,
    hatching: hatching.join(' '),
  };
}
```

**Step 3: Add forest canopy generator**

```javascript
function generateForestCanopy(cluster) {
  // Sort points by x center
  const points = cluster
    .map(p => ({ cx: p.x + p.w / 2, cy: p.y + p.h / 2, size: p.w }))
    .sort((a, b) => a.cx - b.cx);

  // Compute convex hull of point centers
  const hull = convexHull(points.map(p => [p.cx, p.cy]));
  if (hull.length < 3) return null;

  // Create bumpy outline by adding scallops between hull points
  let d = `M ${hull[0][0].toFixed(1)},${hull[0][1].toFixed(1)}`;
  for (let i = 1; i <= hull.length; i++) {
    const prev = hull[i - 1];
    const curr = hull[i % hull.length];
    const midX = (prev[0] + curr[0]) / 2;
    const midY = (prev[1] + curr[1]) / 2;
    // Push midpoint outward for bumpy canopy edge
    const dx = curr[0] - prev[0];
    const dy = curr[1] - prev[1];
    const len = Math.sqrt(dx * dx + dy * dy);
    const bumpSize = Math.min(len * 0.15, 8);
    const nx = -dy / len * bumpSize;
    const ny = dx / len * bumpSize;
    d += ` Q ${(midX + nx).toFixed(1)},${(midY + ny).toFixed(1)} ${curr[0].toFixed(1)},${curr[1].toFixed(1)}`;
  }

  return { outline: d };
}

// Graham scan convex hull
function convexHull(points) {
  if (points.length < 3) return points;
  const pts = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);

  function cross(O, A, B) {
    return (A[0] - O[0]) * (B[1] - O[1]) - (A[1] - O[1]) * (B[0] - O[0]);
  }

  const lower = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0)
      lower.pop();
    lower.push(p);
  }
  const upper = [];
  for (const p of pts.reverse()) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0)
      upper.pop();
    upper.push(p);
  }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}
```

**Step 4: Add terrain data generation orchestrator**

```javascript
function generateTerrainData(relief) {
  const { placements } = relief;
  const COMPOSITE_TYPES = new Set(['mount', 'mountSnow', 'hill', 'conifer', 'coniferSnow', 'deciduous', 'acacia', 'palm']);
  const MOUNTAIN_TYPES = new Set(['mount', 'mountSnow', 'hill']);
  const INDIVIDUAL_TYPES = new Set(['grass', 'dune', 'swamp', 'vulcan', 'cactus', 'deadTree']);
  const MIN_CLUSTER_SIZE = 5;

  // Group placements by type
  const byType = {};
  for (const p of placements) {
    const type = p.href.replace(/^relief-/, '').replace(/-\d+$/, '');
    if (!byType[type]) byType[type] = [];
    byType[type].push(p);
  }

  const composites = [];
  const individuals = [];

  for (const [type, pts] of Object.entries(byType)) {
    if (INDIVIDUAL_TYPES.has(type)) {
      individuals.push(...pts.map(p => ({ ...p, type })));
      continue;
    }

    if (!COMPOSITE_TYPES.has(type)) {
      individuals.push(...pts.map(p => ({ ...p, type })));
      continue;
    }

    const clusters = clusterPlacements(pts);
    for (const cluster of clusters) {
      if (cluster.length < MIN_CLUSTER_SIZE) {
        individuals.push(...cluster.map(p => ({ ...p, type })));
        continue;
      }

      if (MOUNTAIN_TYPES.has(type)) {
        const ridge = generateMountainRidgeline(cluster);
        composites.push({
          type,
          kind: 'ridge',
          outline: ridge.outline,
          hatching: ridge.hatching,
          pointCount: cluster.length,
        });
      } else {
        const canopy = generateForestCanopy(cluster);
        if (canopy) {
          composites.push({
            type,
            kind: 'canopy',
            outline: canopy.outline,
            hatching: '',
            pointCount: cluster.length,
          });
        } else {
          individuals.push(...cluster.map(p => ({ ...p, type })));
        }
      }
    }
  }

  console.log(`\n=== Terrain Composites ===`);
  console.log(`  ${composites.length} composite shapes`);
  console.log(`  ${individuals.length} individual icons remaining`);

  return { composites, individuals };
}
```

**Step 5: Add terrain data writer**

```javascript
function writeTerrainData({ composites, individuals }) {
  const ts = [
    '/**',
    ' * Composite terrain data for Tolkien-style map rendering.',
    ' * Generated by scripts/generate-tiles.mjs — do not edit by hand.',
    ' */',
    '',
    'export interface TerrainComposite {',
    '  type: string;',
    '  kind: "ridge" | "canopy";',
    '  outline: string;',
    '  hatching: string;',
    '  pointCount: number;',
    '}',
    '',
    'export interface TerrainPlacement {',
    '  x: number;',
    '  y: number;',
    '  w: number;',
    '  h: number;',
    '  href: string;',
    '  type: string;',
    '}',
    '',
    'export const TERRAIN_COMPOSITES: TerrainComposite[] = ' + JSON.stringify(composites) + ';',
    '',
    'export const TERRAIN_INDIVIDUALS: TerrainPlacement[] = ' + JSON.stringify(individuals) + ';',
    '',
  ].join('\n');

  const outPath = resolve('src/lib/terrain-data.ts');
  writeFileSync(outPath, ts, 'utf-8');
  console.log('Wrote ' + outPath);
}
```

**Step 6: Wire into main function**

In `main()` (line 916), after `const relief = extractRelief(mapData);`, add:

```javascript
const terrain = generateTerrainData(relief);
```

And after `writeReliefData(relief);` (line 927), add:

```javascript
writeTerrainData(terrain);
```

**Step 7: Run build script**

Run: `node scripts/generate-tiles.mjs mapfiles/SOLUM-PR.map`
Expected: Console shows composite and individual counts. `src/lib/terrain-data.ts` is created.

**Step 8: Commit build script changes**

```bash
git add scripts/generate-tiles.mjs src/lib/terrain-data.ts
git commit -m "Add terrain clustering and composite path generation to build script"
```

---

### Task 4: Composite Terrain — Render Component

**Files:**
- Modify: `src/app/components/map/ReliefLayer.tsx` (full rewrite)

**Step 1: Rewrite `ReliefLayer.tsx` to render composites**

Replace the current individual icon rendering with composite terrain paths. Keep the `TOLKIEN_CONTENT` definitions for individual icons that aren't clustered. Import from `terrain-data.ts` instead of `relief-data.ts`.

Key changes:
- Import `TERRAIN_COMPOSITES` and `TERRAIN_INDIVIDUALS` from `terrain-data.ts`
- Import `RELIEF_SYMBOLS` from `relief-data.ts` (still needed for individual icon `<symbol>` defs)
- Render composite ridgelines as `<path>` with outline + hatching
- Render composite canopies as `<path>` with bumpy outline
- Render remaining individual icons with the existing thinning/sizing logic
- All strokes in black ink, lightweight

```typescript
// Composite rendering in SVG:
{TERRAIN_COMPOSITES.map((comp, i) => (
  <g key={`comp-${i}`}>
    <path
      d={comp.outline}
      fill="none"
      stroke="black"
      strokeWidth={comp.kind === 'ridge' ? 1.0 : 0.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {comp.hatching && (
      <path
        d={comp.hatching}
        fill="none"
        stroke="black"
        strokeWidth={0.4}
        strokeLinecap="round"
      />
    )}
  </g>
))}
```

**Step 2: Apply thinning to individual icons only**

Keep the existing `KEEP_RATE`, `SIZE_SCALE`, `posHash` logic but apply it only to `TERRAIN_INDIVIDUALS` (grass, dunes, swamp, small clusters).

**Step 3: Verify build**

Run: `npm run build -- --webpack`
Expected: Clean build.

**Step 4: Visually verify**

Run: `npm run dev`, navigate to `/map`. Mountain ranges should appear as connected ridgelines with hatching. Forests should appear as bumpy canopy outlines. Grass/dunes/swamp remain as individual scattered icons.

**Step 5: Commit**

```bash
git add src/app/components/map/ReliefLayer.tsx
git commit -m "Render composite terrain ridgelines and forest canopies"
```

---

### Task 5: Label Clearance Zones

**Files:**
- Modify: `src/app/components/map/ReliefLayer.tsx`

**Step 1: Import clearance zone computation**

```typescript
import { computeClearanceZones, type LabelBBox } from '@/lib/label-config';
```

**Step 2: Add point-in-rotated-rect collision check**

```typescript
function isInClearanceZone(px: number, py: number, zones: LabelBBox[]): boolean {
  for (const zone of zones) {
    // Rotate point into label's local coordinate space
    const rad = (-zone.angle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const dx = px - zone.cx;
    const dy = py - zone.cy;
    const localX = dx * cos - dy * sin;
    const localY = dx * sin + dy * cos;
    if (Math.abs(localX) < zone.halfW && Math.abs(localY) < zone.halfH) {
      return true;
    }
  }
  return false;
}
```

**Step 3: Filter individual placements by clearance zones**

In the `visiblePlacements` computation, add a clearance zone filter after the existing thinning:

```typescript
const clearanceZones = computeClearanceZones(12);

const visiblePlacements = TERRAIN_INDIVIDUALS.filter((p) => {
  // ... existing thinning logic ...
}).filter((p) => {
  const cx = p.x + p.w / 2;
  const cy = p.y + p.h / 2;
  return !isInClearanceZone(cx, cy, clearanceZones);
}).map((p) => {
  // ... existing sizing logic ...
});
```

**Step 4: Filter composite paths by clearance zones**

For composites, check if any clearance zone significantly overlaps the path's bounding box. If so, skip rendering that composite. We need to add bounding box data to composites (computed in the build script from cluster points).

**Step 5: Verify build and visual**

Run: `npm run build -- --webpack`
Run: `npm run dev`, verify that terrain icons/paths are cleared around label text, leaving readable parchment space.

**Step 6: Commit**

```bash
git add src/app/components/map/ReliefLayer.tsx
git commit -m "Add label clearance zones to suppress terrain near text labels"
```

---

### Task 6: Final Tuning and Polish

**Files:**
- Modify: `src/lib/label-config.ts` (angle/offset values)
- Modify: `src/app/components/map/ReliefLayer.tsx` (stroke weights, sizes)

**Step 1: Tune label angles by visual inspection**

With the dev server running, adjust `LABEL_OVERRIDES` in `label-config.ts` for each of the 15 regions. Check that:
- Labels follow the natural elongation of their region
- No label overlaps with another region's label or a capital marker
- Labels are readable and not upside-down (keep angles within -90 to 90 degrees)

**Step 2: Tune terrain composite parameters**

Adjust peak heights, hatching density, canopy bump sizes, and stroke weights as needed for visual quality.

**Step 3: Tune clearance zone padding**

Adjust the `padding` parameter in `computeClearanceZones()` and the per-character width estimate until clearance looks natural (enough space around text without leaving conspicuous gaps).

**Step 4: Final build verification**

Run: `npm run build -- --webpack`
Expected: Clean build, no warnings.

**Step 5: Commit all tuning**

```bash
git add -A
git commit -m "Tune label angles, terrain composites, and clearance zones"
```

---

## Summary

| Task | Description | Key files |
|------|-------------|-----------|
| 1 | Shared label config + rotated labels | `label-config.ts`, `RegionLabels.tsx`, `CapitalMarkers.tsx` |
| 2 | Outward coastline echo lines | `generate-tiles.mjs`, `map-data.ts`, `OceanContours.tsx` |
| 3 | Terrain clustering + composite paths (build) | `generate-tiles.mjs`, `terrain-data.ts` |
| 4 | Composite terrain rendering (component) | `ReliefLayer.tsx` |
| 5 | Label clearance zones | `ReliefLayer.tsx`, `label-config.ts` |
| 6 | Visual tuning pass | All map files |
