# Custom Hand-Drawn Relief Icons Design

**Date:** 2026-02-21
**Feature:** Replace Azgaar SVG relief symbols with hand-drawn icons extracted from the high-res map PNG

---

## Goal

Replace the Azgaar-generated SVG terrain symbols on `/map` with custom hand-drawn icons created by the artist in Photoshop and embedded in the high-resolution QGIS export PNG. Also increase icon sizes so terrain reads more clearly at normal map zoom.

---

## Source Material

- **Input PNG:** `mapfiles/solum-pr-qgis-12000 copy.png` (12000px wide)
- **Icon types:** mountains, hills, 3 tree variants (tree-a, tree-b, tree-c), grass
- **Variants per type:** 3 (18 PNGs total)
- Icons are individually placed (not a brush/texture pattern), making individual instances extractable

---

## Architecture

### 1. Extraction Script — `scripts/extract-icons.mjs`

A one-time extraction script that reads the high-res PNG and a crop config, then outputs 18 transparent PNGs to `public/map-icons/`.

**Steps per icon:**
1. **Crop** — tight bounding box around a clean icon instance, specified in a JSON config (`scripts/icon-crops.json`)
2. **Background removal** — euclidean color-distance from sampled parchment color; pixels within a tunable threshold become transparent. Dark drawn strokes survive cleanly.
3. **Resize** — output at 200×200px
4. **Output** — `public/map-icons/{type}-{n}.png` (e.g. `mountain-1.png`, `tree-a-2.png`)

**Flags:**
- `--preview` — outputs a contact sheet (`public/map-icons/preview.png`) of all 18 crops for visual verification before committing
- `--threshold N` — tune background removal sensitivity (default: 80, range 0–255)

**Dependency:** `jimp` (pure JS, `npm install --save-dev jimp`)

**Crop config format (`scripts/icon-crops.json`):**
```json
{
  "mountain": [
    { "x": 1234, "y": 567, "w": 180, "h": 180 },
    { "x": 2100, "y": 890, "w": 160, "h": 160 },
    { "x": 3400, "y": 450, "w": 200, "h": 200 }
  ],
  "hill": [ ... ],
  "tree-a": [ ... ],
  "tree-b": [ ... ],
  "tree-c": [ ... ],
  "grass":  [ ... ]
}
```

The crop coordinates are identified by the artist in Photoshop (note pixel x/y of top-left + width/height for 3 clean instances of each type).

---

### 2. Custom Symbol Definitions — `src/lib/custom-relief-symbols.ts`

Exports a typed map from icon type to its 3 variant PNG paths:

```typescript
export const CUSTOM_RELIEF_SYMBOLS: Record<string, string[]> = {
  'mountain': ['/map-icons/mountain-1.png', '/map-icons/mountain-2.png', '/map-icons/mountain-3.png'],
  'hill':     ['/map-icons/hill-1.png',     '/map-icons/hill-2.png',     '/map-icons/hill-3.png'],
  'tree-a':   ['/map-icons/tree-a-1.png',   '/map-icons/tree-a-2.png',   '/map-icons/tree-a-3.png'],
  'tree-b':   ['/map-icons/tree-b-1.png',   '/map-icons/tree-b-2.png',   '/map-icons/tree-b-3.png'],
  'tree-c':   ['/map-icons/tree-c-1.png',   '/map-icons/tree-c-2.png',   '/map-icons/tree-c-3.png'],
  'grass':    ['/map-icons/grass-1.png',     '/map-icons/grass-2.png',     '/map-icons/grass-3.png'],
};
```

---

### 3. ReliefLayer.tsx — Custom Symbol Integration

**Azgaar type → custom type mapping** (to be confirmed with artist during implementation):

```typescript
const AZGAAR_TO_CUSTOM: Record<string, string> = {
  mount:       'mountain',
  mountSnow:   'mountain',
  hill:        'hill',
  conifer:     'tree-a',
  coniferSnow: 'tree-a',
  deciduous:   'tree-b',
  acacia:      'tree-c',
  palm:        'tree-c',
  grass:       'grass',
};
```

Types not in this map (dune, swamp, vulcan, cactus, deadTree) continue using Azgaar SVG symbols unchanged.

**SVG `<symbol>` defs** — for each custom type + variant, declare:
```svg
<symbol id="custom-mountain-1" viewBox="0 0 200 200">
  <image href="/map-icons/mountain-1.png" width="200" height="200"/>
</symbol>
```

**Deterministic variant assignment** — uses the existing `posHash(x, y)` to pick variant index (1/2/3). Same placement always gets the same variant, map is stable across renders:
```typescript
const variantIdx = (Math.floor(posHash(p.x, p.y) * 3)) + 1;
const customHref = `custom-${customType}-${variantIdx}`;
```

---

### 4. SIZE_SCALE Increases

Updated values in `ReliefLayer.tsx` — tunable after first visual check:

| Type | Current | Proposed |
|------|---------|----------|
| mount / mountSnow | 0.70 | 1.8 |
| hill | 0.60 | 1.4 |
| conifer / coniferSnow | 0.55 | 1.1 |
| deciduous | 0.55 | 1.1 |
| acacia / palm | 0.55 | 1.1 |
| grass | 0.50 | 0.9 |

Unmapped types (dune, swamp, etc.) keep their current scale values.

---

## File Changes Summary

| Action | File |
|--------|------|
| Create (run once) | `scripts/extract-icons.mjs` |
| Create (run once) | `scripts/icon-crops.json` |
| Create (generated) | `public/map-icons/*.png` (18 files) |
| Create | `src/lib/custom-relief-symbols.ts` |
| Modify | `src/app/components/map/ReliefLayer.tsx` |

---

## Verification

1. Run `node scripts/extract-icons.mjs --preview` → inspect contact sheet
2. Run `node scripts/extract-icons.mjs` → generate 18 PNGs
3. `npm run build -- --webpack` → clean build
4. Visual check at `/map`: icons visible, hand-drawn character preserved, size reads well at default zoom
5. Tune SIZE_SCALE and/or `--threshold` as needed

---

## Out of Scope

- Animated icons
- Icons for unmapped terrain types (dune, swamp, vulcan, cactus, deadTree)
- Any changes outside `/map`
