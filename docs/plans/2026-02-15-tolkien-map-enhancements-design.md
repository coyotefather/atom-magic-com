# Tolkien Map Enhancements Design

## Goal

Bring the interactive world map closer to Tolkien's 1954 Middle-earth hand-drawn style through four enhancements: composite terrain art, coastline echo lines, label clearance zones, and rotated/curved region labels.

## Feature 1: Composite Terrain Silhouettes

### Problem

6,680 individual relief icons (thinned to ~1,618 at render) create scattered dot patterns. Tolkien draws connected mountain ranges and forest canopy masses — single composite shapes that suggest terrain areas.

### Approach

**Build-time clustering** in `generate-tiles.mjs`:

1. Group the existing 6,680 placements by terrain type.
2. Cluster nearby placements (within ~40px) using proximity grouping.
3. For each cluster, generate a composite SVG path:
   - **Mountains/hills** (clusters of 5+): Ridgeline silhouette — connected series of peaks/bumps along the top edge, with hatching lines on one side. Peaks vary in height based on original placement sizes.
   - **Forests** (conifer/deciduous/acacia/palm, clusters of 5+): Canopy outline — bumpy blob following the convex hull, with internal texture lines suggesting individual trees.
   - **Grass**: Keep as individual thinned icons (already subtle enough).
   - **Dunes/swamp/cactus/deadTree**: Keep as individual icons (sparse, < 200 total).
4. Small clusters (< 5 placements) remain as individual icons.

**Output:** New data file `src/lib/terrain-data.ts` with:
- `TerrainCluster[]` — composite SVG path strings with type, bounding box
- `TerrainPlacement[]` — remaining individual icons (small clusters + grass/dune/swamp)

**Component:** Rewrite `ReliefLayer.tsx` to render composite paths and remaining individual icons.

### Cluster Distribution (from analysis)

| Type | Placements | Clusters | Largest clusters |
|------|-----------|----------|-----------------|
| mount | 113 | 4 | 59, 47, 4, 3 |
| hill | 359 | 11 | 220, 62, 43, 11, 5 |
| conifer | 1058 | 15 | 844, 77, 31, 27, 23 |
| deciduous | 1593 | 21 | 726, 261, 137, 106, 99 |
| grass | 3053 | 21 | 1312, 1090 (keep individual) |

## Feature 2: Coastline Echo Lines

### Problem

Tolkien's map has 2-3 fine lines in the ocean that closely follow the coastline shape. The existing 8 contour levels offset inward (into the land) with dashed patterns.

### Approach

Keep the existing 8 inward-dashed contours. Add 2-3 new contour levels that offset **outward** into the ocean:

- Offsets: `[0.008, 0.018, 0.03]` (very tight to coastline)
- Style: solid lines (no dashArray), thin (0.6-0.9 weight), moderate opacity (0.15-0.30)
- Progressively fainter further from coast

**Implementation:** Extend `generateOceanContours` in the build script to also generate outward-offset rings. Add a `direction` property to contour features. Update `OceanContours.tsx` to style inward vs outward contours differently.

## Feature 3: Label Clearance Zones

### Problem

Relief icons render underneath text labels, reducing readability. Tolkien leaves blank parchment space where text is placed.

### Approach

At render time in `ReliefLayer.tsx`:

1. Compute bounding boxes for all visible labels (region names + capitals).
2. Account for label rotation angles (from feature 4) and font metrics.
3. Add padding (~10-15px in SVG space) around each bounding box.
4. Filter out any terrain placement/path whose center falls within any clearance zone.

For composite terrain paths (feature 1), if a clearance zone intersects a path, we clip or split the path. Simpler initial approach: skip rendering composite paths that significantly overlap a label zone, and omit individual icons within zones.

**Data flow:** Label position/rotation data must be accessible to ReliefLayer. Export label configs from a shared module that both `RegionLabels.tsx` and `ReliefLayer.tsx` import.

## Feature 4: Rotated/Curved Region Labels

### Problem

Labels are currently horizontal and centered on region centroids. Tolkien's labels follow the natural shape of regions — tilted along mountain ranges, curved along coasts.

### Approach

**Per-region label overrides** in a shared config module:

```typescript
interface LabelConfig {
  regionId: string;
  name: string;
  svgX: number;       // position (from centroid computation)
  svgY: number;
  angle?: number;     // rotation in degrees
  dx?: number;        // offset from centroid
  dy?: number;
  curveRadius?: number; // for SVG textPath on arc (optional)
}
```

**Auto-seeding:** Build script computes initial angles from each region polygon's longest axis (oriented bounding box / PCA). These are written to the data file and can be manually tuned.

**Rendering:**
- Simple rotation: SVG `transform="rotate(angle, x, y)"` on `<text>`
- Curved text: SVG `<textPath>` following a `<path>` arc defined by `curveRadius`
- Collision avoidance: After positioning, check for overlaps between region labels and capital labels; apply small offsets where needed.

## Architecture

### Files Modified
- `scripts/generate-tiles.mjs` — clustering, composite path generation, outward contours, label angle computation
- `src/lib/terrain-data.ts` — new generated file for composite terrain
- `src/lib/map-data.ts` — label angle/offset data added to generation
- `src/app/components/map/ReliefLayer.tsx` — render composites, clearance filtering
- `src/app/components/map/RegionLabels.tsx` — rotation/curve rendering
- `src/app/components/map/OceanContours.tsx` — outward contour styles
- `src/lib/label-config.ts` — shared label position/rotation data (new)

### Data Flow
```
.map file → generate-tiles.mjs → terrain-data.ts (composites + individual)
                                → map-data.ts (contours + label angles)
                                → label-config.ts (shared label positions)

label-config.ts → RegionLabels.tsx (rendering)
               → ReliefLayer.tsx (clearance zones)
```

## Implementation Order

1. Feature 4 (rotated labels) — foundational, needed by feature 3
2. Feature 2 (coastline lines) — independent, quick win
3. Feature 1 (composite terrain) — largest change, most impactful
4. Feature 3 (label clearance) — depends on features 1 and 4
