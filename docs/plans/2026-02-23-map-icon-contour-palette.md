# Map Visual Polish: Icon Clearance, Contour Fix, Watercolor Palette

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix ocean contour direction, prevent relief icons from overlapping borders or each other, and replace the color palette with a watercolor-on-parchment aesthetic.

**Architecture:** Four independent changes in separate commits: (1) build script contour fix + rebuild, (2) color palette in CSS + BiomeFillLayer, (3) border proximity filter added to ReliefLayer module-load pipeline, (4) AABB overlap greedy sweep at end of same pipeline. All computation happens once at module load — no runtime cost.

**Tech Stack:** React, TypeScript, SVG, Leaflet/react-leaflet, Node.js (build script), Vitest.

---

### Task 1: Fix Ocean Contour Direction

**Files:**
- Modify: `scripts/generate-tiles.mjs:869`

**Step 1: Change the direction computation**

In `scripts/generate-tiles.mjs`, at line 869, inside `offsetRing()`, change:
```js
const dir = area < 0 ? 1 : -1;
```
to:
```js
const dir = area < 0 ? -1 : 1;
```

Explanation: `signedArea()` returns a positive value for CCW-wound GeoJSON rings (which is what the coastline rings are). The old code evaluated `area < 0` as `false`, giving `dir = -1` (inward normals). The fix makes `dir = 1` for positive-area CCW rings, producing outward normals so contours spread into the ocean.

**Step 2: Rebuild map data**
```bash
node scripts/generate-tiles.mjs mapfiles/SOLUM-PR.map
```
Expected: script completes without errors, `src/lib/map-data.ts` is regenerated.

**Step 3: Verify in dev**
```bash
npm run dev
```
Open http://localhost:3000/map — contour lines should now appear in the ocean spreading outward from coastlines. They should NOT bleed inland onto landmasses.

**Step 4: Commit**
```bash
git add scripts/generate-tiles.mjs src/lib/map-data.ts
git commit -m "fix(map): correct ocean contour direction to spread outward from coastlines"
```

---

### Task 2: Watercolor Parchment Palette

**Files:**
- Modify: `src/app/components/map/SolumMap.css:5`
- Modify: `src/app/components/map/BiomeFillLayer.tsx:9-25`

**Step 1: Update ocean background color**

In `src/app/components/map/SolumMap.css`, change line 5:
```css
background-color: #C4BB9A;
```
to:
```css
background-color: #BACDD8;
```
This replaces the warm khaki with a pale cerulean blue that reads as water while staying light enough to feel like parchment with a watercolor wash.

**Step 2: Update biome fill colors**

In `src/app/components/map/BiomeFillLayer.tsx`, replace lines 9–25 (the `BIOME_FILL_COLORS` block through `DEAD_LAND_FILL`) with:
```typescript
// Watercolor wash colours per Azgaar biome ID — light tints over parchment
const BIOME_FILL_COLORS: Record<number, string> = {
	11: '#EDEAE0', // Glacier — near-white parchment wash
	9:  '#D4D5B8', // Taiga — pale sage
	6:  '#D2D4B5', // Temperate deciduous forest — pale sage-green
	8:  '#D0D2B2', // Temperate rain forest — pale medium sage
	7:  '#D2D4AE', // Tropical rain forest — pale olive wash
	5:  '#D5D7BB', // Tropical seasonal forest — pale light sage
	4:  '#DCDABC', // Grassland — pale warm green-tan
	3:  '#DDD7BB', // Savanna — pale warm tan
	2:  '#DDD3B5', // Cold desert — pale sandy
	1:  '#DDD0A0', // Hot desert — pale warm ochre
	10: '#DAD5BC', // Tundra — pale warm tan
	12: '#C5C9B0', // Wetland — pale grey-olive
};

const DEFAULT_FILL = '#DDD8B8';
const DEAD_LAND_FILL = '#BBB5A8'; // pale ashy grey — barren but not opaque black
```

All values are significantly lighter/more desaturated than before (L ~78–88% vs ~50–60%). At `fillOpacity={0.5}` these read as very subtle washes over the ocean background.

**Step 3: Visual check in dev**
```bash
npm run dev
```
Open http://localhost:3000/map. Land areas should look like light watercolor washes — different biome tints subtly distinguishable but all feeling like they're on the same parchment. Ocean is a clear pale blue. Terrae Mortuae regions are a pale ash grey-brown. If any colors feel off, adjust the individual hex values — the exact values above are a starting point, not sacred.

**Step 4: Commit**
```bash
git add src/app/components/map/SolumMap.css src/app/components/map/BiomeFillLayer.tsx
git commit -m "feat(map): watercolor parchment palette — light biome washes, pale blue ocean"
```

---

### Task 3: Border Proximity Clearance for Relief Icons

**Files:**
- Modify: `src/app/components/map/ReliefLayer.tsx`

This adds a filter that rejects icon placements whose centers fall within 3.5 SVG units of any region border segment. Everything happens at module load.

**Step 1: Add border segment extraction and proximity check**

In `src/app/components/map/ReliefLayer.tsx`, after the `TM_POLYGONS` block (currently ending around line 114, just before `function isInTerraeMoretuae`) add:

```typescript
/** Pre-compute region border segments in SVG coordinate space for proximity checks.
 *  GeoJSON coords are [lng, lat]; SVG = (lng*32, -lat*32). */
const BORDER_SEGMENTS: Array<[number, number, number, number]> = [];
for (const feature of REGION_BOUNDARIES.features) {
	const geom = feature.geometry;
	let rings: number[][][] = [];
	if (geom.type === 'Polygon') {
		rings = [geom.coordinates[0] as number[][]];
	} else if (geom.type === 'MultiPolygon') {
		rings = (geom.coordinates as number[][][][]).map((p) => p[0]);
	}
	for (const ring of rings) {
		for (let i = 0; i < ring.length - 1; i++) {
			const [lngA, latA] = ring[i];
			const [lngB, latB] = ring[i + 1];
			BORDER_SEGMENTS.push([lngA * 32, -latA * 32, lngB * 32, -latB * 32]);
		}
	}
}

const BORDER_CLEARANCE = 3.5;

/** Returns true if (px, py) is within BORDER_CLEARANCE SVG units of any border segment. */
function isNearBorder(px: number, py: number): boolean {
	const c = BORDER_CLEARANCE;
	const cSq = c * c;
	for (const [ax, ay, bx, by] of BORDER_SEGMENTS) {
		// Bounding box early exit
		if (px < Math.min(ax, bx) - c) continue;
		if (px > Math.max(ax, bx) + c) continue;
		if (py < Math.min(ay, by) - c) continue;
		if (py > Math.max(ay, by) + c) continue;
		// Point-to-segment distance squared
		const dx = bx - ax, dy = by - ay;
		const lenSq = dx * dx + dy * dy;
		const t = lenSq > 0 ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq)) : 0;
		const nearX = ax + t * dx, nearY = ay + t * dy;
		if ((px - nearX) ** 2 + (py - nearY) ** 2 < cSq) return true;
	}
	return false;
}
```

**Step 2: Add filter step to the visiblePlacements pipeline**

The `visiblePlacements` declaration currently has this chain:
```typescript
const visiblePlacements = RELIEF_PLACEMENTS.map(...)  // add type
  .filter(...)                                         // keep rate
  .filter(...)                                         // clearance zones
  .map(...)                                            // resize + compute href
```

After the clearance-zone `.filter()` and BEFORE the final `.map()` (the resize step), insert:
```typescript
.filter((p) => {
	const cx = p.x + p.w / 2;
	const cy = p.y + p.h / 2;
	return !isNearBorder(cx, cy);
})
```

**Step 3: Verify TypeScript builds**
```bash
npm run build 2>&1 | tail -20
```
Expected: no TypeScript errors, build completes successfully.

**Step 4: Visual check in dev**
```bash
npm run dev
```
Zoom into a region border. Icons should have a clear gap along border lines. If the gap feels too wide or too narrow, adjust `BORDER_CLEARANCE` (try 2.5–5.0 range).

**Step 5: Commit**
```bash
git add src/app/components/map/ReliefLayer.tsx
git commit -m "feat(map): filter relief icons within 3.5 SVG units of region borders"
```

---

### Task 4: AABB Overlap Prevention for Relief Icons

**Files:**
- Modify: `src/app/components/map/ReliefLayer.tsx`

After all other filtering, a greedy pass rejects icons whose bounding boxes overlap any already-accepted icon.

**Step 1: Append a `.reduce()` step to the visiblePlacements pipeline**

The `visiblePlacements` pipeline currently ends with `.map((p) => { ... return { x, y, w, h, href }; })`. Add a `.reduce()` call immediately after that `.map()`:

```typescript
.reduce<Array<{ x: number; y: number; w: number; h: number; href: string }>>(
	(accepted, p) => {
		const pad = 1.0; // gap between icon edges in SVG units
		const pL = p.x - pad, pR = p.x + p.w + pad;
		const pT = p.y - pad, pB = p.y + p.h + pad;
		for (const a of accepted) {
			if (pR > a.x && pL < a.x + a.w && pB > a.y && pT < a.y + a.h) return accepted;
		}
		accepted.push(p);
		return accepted;
	},
	[]
)
```

The AABB check uses `pad = 1.0` (one SVG unit) as a minimum gap around each icon. Each candidate is rejected if its padded box intersects any already-accepted icon's (unpadded) box.

**Step 2: Verify TypeScript builds**
```bash
npm run build 2>&1 | tail -20
```
Expected: no TypeScript errors.

**Step 3: Visual check in dev**
```bash
npm run dev
```
Check forested and grassland areas. Icons should be clearly spaced — no stacking. If the thinning feels too aggressive, reduce `pad` to 0.5; if icons still touch, increase to 1.5.

**Step 4: Run test suite**
```bash
npx vitest run
```
Expected: all tests pass (these are non-map unit tests; just verifying no regressions from the TypeScript changes).

**Step 5: Commit**
```bash
git add src/app/components/map/ReliefLayer.tsx
git commit -m "feat(map): greedy AABB pass to prevent relief icons overlapping each other"
```

---

### Task 5: Final Verification

**Step 1: Production build**
```bash
npm run build 2>&1 | tail -30
```
Expected: clean build, no TypeScript errors.

**Step 2: Run test suite**
```bash
npx vitest run
```
Expected: all tests pass.

**Step 3: Dev smoke test checklist**
```bash
npm run dev
```
Verify at http://localhost:3000/map:
- [ ] Ocean contour lines visible in the ocean, spreading outward from coastlines (not bleeding inland)
- [ ] Ocean color is pale blue-grey, land areas are light watercolor washes
- [ ] Terrae Mortuae regions are visibly distinct (pale ashy grey vs green washes elsewhere)
- [ ] Relief icons have a clear gap along region borders
- [ ] Relief icons in dense areas (forests, grasslands) are clearly spaced, no stacking
- [ ] Zoom in/out, pan, region hover tooltip, and region click/focus all still work
- [ ] City labels still appear at max zoom
- [ ] Region labels still visible and positioned correctly
