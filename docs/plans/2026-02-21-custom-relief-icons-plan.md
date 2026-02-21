# Custom Hand-Drawn Relief Icons Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace Azgaar SVG terrain symbols on `/map` with hand-drawn PNG icons extracted from the high-res source map, and increase icon sizes.

**Architecture:** A one-time extraction script (`scripts/extract-icons.mjs`) crops 18 individual icon instances from `mapfiles/solum-pr-qgis-12000 copy.png`, removes the parchment background via color-distance masking, and outputs transparent PNGs to `public/map-icons/`. `ReliefLayer.tsx` is updated to use these PNGs as SVG `<image>` symbols in place of Azgaar content for 6 terrain types; unmapped types (dune, swamp, vulcan, etc.) keep Azgaar symbols unchanged.

**Tech Stack:** Node.js ESM scripts, `sharp` (dev dep), React/TypeScript, react-leaflet SVGOverlay.

**Design doc:** `docs/plans/2026-02-21-custom-relief-icons-design.md`

**No unit tests** — visual output only. Verification: `npm run build -- --webpack` (clean) + visual check at `/map`.

> ⚠️ **USER ACTION REQUIRED in Task 2.** The extraction script cannot run until crop coordinates are filled in. This is a blocking step.

---

## Task 1: Install sharp + create output directory

**Files:**
- Modify: `package.json` (devDependencies)

### Step 1: Install sharp as dev dependency

```bash
npm install --save-dev sharp
```

Expected: `package.json` devDependencies gains `"sharp": "^0.33.x"`.

### Step 2: Verify sharp loads

```bash
node -e "import('sharp').then(m => console.log('sharp ok:', m.default.versions.sharp))"
```

Expected: prints `sharp ok: 0.33.x`

### Step 3: Create output directory

```bash
mkdir -p public/map-icons
```

### Step 4: Commit

```bash
git add package.json package-lock.json
git commit -m "chore: add sharp dev dep for icon extraction"
```

---

## Task 2: Create icon-crops.json template

**Files:**
- Create: `scripts/icon-crops.json`

### Step 1: Create the template file

```json
{
  "_instructions": "Fill in pixel coordinates for 3 clean instances of each icon type in mapfiles/solum-pr-qgis-12000 copy.png. In Photoshop: Window > Info shows cursor X/Y. x/y = top-left corner of crop box, w/h = dimensions. Aim for tight crops with a few pixels of parchment padding.",
  "mountain": [
    { "x": 0, "y": 0, "w": 200, "h": 200 },
    { "x": 0, "y": 0, "w": 200, "h": 200 },
    { "x": 0, "y": 0, "w": 200, "h": 200 }
  ],
  "hill": [
    { "x": 0, "y": 0, "w": 200, "h": 200 },
    { "x": 0, "y": 0, "w": 200, "h": 200 },
    { "x": 0, "y": 0, "w": 200, "h": 200 }
  ],
  "tree-a": [
    { "x": 0, "y": 0, "w": 200, "h": 200 },
    { "x": 0, "y": 0, "w": 200, "h": 200 },
    { "x": 0, "y": 0, "w": 200, "h": 200 }
  ],
  "tree-b": [
    { "x": 0, "y": 0, "w": 200, "h": 200 },
    { "x": 0, "y": 0, "w": 200, "h": 200 },
    { "x": 0, "y": 0, "w": 200, "h": 200 }
  ],
  "tree-c": [
    { "x": 0, "y": 0, "w": 200, "h": 200 },
    { "x": 0, "y": 0, "w": 200, "h": 200 },
    { "x": 0, "y": 0, "w": 200, "h": 200 }
  ],
  "grass": [
    { "x": 0, "y": 0, "w": 200, "h": 200 },
    { "x": 0, "y": 0, "w": 200, "h": 200 },
    { "x": 0, "y": 0, "w": 200, "h": 200 }
  ]
}
```

### Step 2: ⚠️ USER ACTION — fill in crop coordinates

Open `mapfiles/solum-pr-qgis-12000 copy.png` in Photoshop.

For each icon type, identify 3 clean, isolated instances and record pixel coordinates (x/y = top-left corner, w/h = bounding box). Replace all `"x": 0, "y": 0` placeholder values in `scripts/icon-crops.json`.

Tips:
- **Mountains** — look near the Boreas/Glacialis region (upper-centre of the map)
- **Hills** — scattered across mid-elevation areas
- **Tree variants** — find 3 visually distinct tree icon designs; pick 3 instances of each
- **Grass** — look in the grassland/savanna regions

### Step 3: Commit

```bash
git add scripts/icon-crops.json
git commit -m "chore: add icon crop coordinates config"
```


---

## Task 3: Create extract-icons.mjs

**Files:**
- Create: `scripts/extract-icons.mjs`

### Step 1: Create the script

```javascript
#!/usr/bin/env node
/**
 * Extracts hand-drawn relief icons from the high-res map PNG.
 * Removes parchment background via color-distance masking.
 * Outputs 200x200 transparent PNGs to public/map-icons/.
 *
 * Usage:
 *   node scripts/extract-icons.mjs [--preview] [--threshold 80] [--parchment c8bd9e]
 */

import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
const PREVIEW = args.includes('--preview');

function getArg(name, fallback) {
    const i = args.indexOf(name);
    return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
}

const THRESHOLD = parseInt(getArg('--threshold', '80'), 10);
const parchmentHex = getArg('--parchment', 'c8bd9e');

function hexToRgb(hex) {
    const n = parseInt(hex.replace('#', ''), 16);
    return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff };
}
const PARCHMENT = hexToRgb(parchmentHex);

const SOURCE_PNG = resolve(__dirname, '../mapfiles/solum-pr-qgis-12000 copy.png');
const CROPS_CONFIG = resolve(__dirname, 'icon-crops.json');
const OUT_DIR = resolve(__dirname, '../public/map-icons');

if (!existsSync(SOURCE_PNG)) { console.error('Source PNG not found: ' + SOURCE_PNG); process.exit(1); }
if (!existsSync(CROPS_CONFIG)) { console.error('Crop config not found: ' + CROPS_CONFIG); process.exit(1); }

const crops = JSON.parse(readFileSync(CROPS_CONFIG, 'utf-8'));
for (const key of Object.keys(crops)) { if (key.startsWith('_')) delete crops[key]; }

if (!existsSync(OUT_DIR)) { mkdirSync(OUT_DIR, { recursive: true }); }

function removeBackground(rawData) {
    const buf = Buffer.from(rawData);
    for (let i = 0; i < buf.length; i += 4) {
        const dr = buf[i]     - PARCHMENT.r;
        const dg = buf[i + 1] - PARCHMENT.g;
        const db = buf[i + 2] - PARCHMENT.b;
        if (Math.sqrt(dr * dr + dg * dg + db * db) < THRESHOLD) {
            buf[i + 3] = 0;
        }
    }
    return buf;
}

async function extractIcon(type, variantIdx, cropBox) {
    console.log('  ' + type + '-' + variantIdx +
        ': crop (' + cropBox.x + ',' + cropBox.y + ' ' + cropBox.w + 'x' + cropBox.h + ')');

    const { data } = await sharp(SOURCE_PNG)
        .extract({ left: cropBox.x, top: cropBox.y, width: cropBox.w, height: cropBox.h })
        .resize(200, 200)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

    const processed = removeBackground(data);

    const outPath = resolve(OUT_DIR, type + '-' + variantIdx + '.png');
    await sharp(processed, { raw: { width: 200, height: 200, channels: 4 } })
        .png()
        .toFile(outPath);

    return { type, variantIdx, data: processed };
}

async function createPreview(allResults) {
    const types = Object.keys(crops);
    const CELL = 210;
    const W = types.length * CELL;
    const H = 3 * CELL;
    const composites = [];

    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < types.length; col++) {
            const result = allResults.find(
                (r) => r.type === types[col] && r.variantIdx === row + 1
            );
            if (!result) continue;
            const iconBuf = await sharp(result.data, {
                raw: { width: 200, height: 200, channels: 4 },
            })
                .flatten({ background: { r: 245, g: 240, b: 225 } })
                .png()
                .toBuffer();
            composites.push({ input: iconBuf, top: row * CELL + 5, left: col * CELL + 5 });
        }
    }

    const previewPath = resolve(OUT_DIR, 'preview.png');
    await sharp({
        create: { width: W, height: H, channels: 3, background: { r: 245, g: 240, b: 225 } },
    })
        .composite(composites)
        .png()
        .toFile(previewPath);

    console.log('Preview: ' + previewPath);
}

async function main() {
    console.log('=== Icon Extraction ===');
    console.log('Parchment: #' + parchmentHex + '  Threshold: ' + THRESHOLD + '\n');

    const allResults = [];
    for (const [type, variants] of Object.entries(crops)) {
        console.log(type + ':');
        for (let i = 0; i < variants.length; i++) {
            allResults.push(await extractIcon(type, i + 1, variants[i]));
        }
    }

    if (PREVIEW) {
        console.log('\nBuilding preview contact sheet...');
        await createPreview(allResults);
    }

    console.log('\n=== Done — ' + allResults.length + ' icons in public/map-icons/ ===');
}

main().catch((err) => { console.error(err); process.exit(1); });
```

### Step 2: Commit

```bash
git add scripts/extract-icons.mjs
git commit -m "feat(map): add icon extraction script"
```

---

## Task 4: Fill coordinates + verify preview

> ⚠️ **Requires Task 2 USER ACTION to be complete** — crop coordinates must be filled in `scripts/icon-crops.json`.

### Step 1: Run with --preview

```bash
node scripts/extract-icons.mjs --preview
```

Expected: 18 files written to `public/map-icons/`, contact sheet at `public/map-icons/preview.png`.

### Step 2: Inspect contact sheet

```bash
open public/map-icons/preview.png
```

Check: hand-drawn character preserved, parchment background transparent around each stroke.

If background not fully removed (parchment patches remaining):
```bash
node scripts/extract-icons.mjs --preview --threshold 100
```

If strokes are being erased (too aggressive):
```bash
node scripts/extract-icons.mjs --preview --threshold 60
```

If the parchment colour looks off, sample it from the source PNG in Photoshop (Eyedropper tool) and pass as hex:
```bash
node scripts/extract-icons.mjs --preview --parchment d2c5a4
```

### Step 3: Commit PNGs + final config

```bash
git add public/map-icons/ scripts/icon-crops.json
git commit -m "feat(map): extracted hand-drawn relief icon PNGs"
```


---

## Task 5: Create custom-relief-symbols.ts

**Files:**
- Create: `src/lib/custom-relief-symbols.ts`

> **Note:** Before writing this file, confirm with the artist which of their 3 tree types (tree-a, tree-b, tree-c) maps to which terrain (conifer/coniferSnow, deciduous, acacia/palm). Update `AZGAAR_TO_CUSTOM` in Task 6 to match.

### Step 1: Create the file

```typescript
/**
 * Custom hand-drawn relief icon paths.
 * Extracted from mapfiles/solum-pr-qgis-12000 copy.png.
 * Each type has 3 variants for visual variety.
 */
export const CUSTOM_RELIEF_SYMBOLS: Record<string, [string, string, string]> = {
    mountain: [
        '/map-icons/mountain-1.png',
        '/map-icons/mountain-2.png',
        '/map-icons/mountain-3.png',
    ],
    hill: [
        '/map-icons/hill-1.png',
        '/map-icons/hill-2.png',
        '/map-icons/hill-3.png',
    ],
    'tree-a': [
        '/map-icons/tree-a-1.png',
        '/map-icons/tree-a-2.png',
        '/map-icons/tree-a-3.png',
    ],
    'tree-b': [
        '/map-icons/tree-b-1.png',
        '/map-icons/tree-b-2.png',
        '/map-icons/tree-b-3.png',
    ],
    'tree-c': [
        '/map-icons/tree-c-1.png',
        '/map-icons/tree-c-2.png',
        '/map-icons/tree-c-3.png',
    ],
    grass: [
        '/map-icons/grass-1.png',
        '/map-icons/grass-2.png',
        '/map-icons/grass-3.png',
    ],
};
```

### Step 2: Verify TypeScript

```bash
npx tsc --noEmit 2>&1 | grep custom-relief
```

Expected: no output (no errors).

### Step 3: Commit

```bash
git add src/lib/custom-relief-symbols.ts
git commit -m "feat(map): add custom relief symbol paths"
```

---

## Task 6: Update ReliefLayer.tsx

**Files:**
- Modify: `src/app/components/map/ReliefLayer.tsx`

Three changes: (A) add import, (B) update SIZE_SCALE + add AZGAAR_TO_CUSTOM mapping, (C) remap placement hrefs + update render.

### Step 1: Add import (after existing imports)

```typescript
import { CUSTOM_RELIEF_SYMBOLS } from '@/lib/custom-relief-symbols';
```

### Step 2: Replace SIZE_SCALE constant

```typescript
const SIZE_SCALE: Record<string, number> = {
    mount:       1.8,
    mountSnow:   1.8,
    hill:        1.4,
    conifer:     1.1,
    coniferSnow: 1.1,
    deciduous:   1.1,
    grass:       0.9,
    acacia:      1.1,
    palm:        1.1,
    dune:        0.6,
    swamp:       0.55,
    vulcan:      0.7,
    cactus:      0.5,
    deadTree:    0.55,
};
```

### Step 3: Add AZGAAR_TO_CUSTOM after SIZE_SCALE

```typescript
/** Maps Azgaar terrain type to custom icon type. Confirm tree-a/b/c mapping with artist. */
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

### Step 4: Update visiblePlacements .map() to remap hrefs

Find the `.map((p) => {` step at the end of the `visiblePlacements` chain (currently ends with `return { x, y, w, h, href: p.href }`).

Replace the entire `.map()` callback with:

```typescript
.map((p) => {
    const scale = SIZE_SCALE[p.type] ?? 0.6;
    const newW = p.w * scale;
    const newH = p.h * scale;
    const cx = p.x + p.w / 2;
    const cy = p.y + p.h / 2;

    const customType = AZGAAR_TO_CUSTOM[p.type];
    let href = p.href;
    if (customType) {
        const variantIdx = Math.floor(posHash(p.x, p.y) * 3) + 1;
        href = `custom-${customType}-${variantIdx}`;
    }

    return { x: cx - newW / 2, y: cy - newH / 2, w: newW, h: newH, href };
});
```

### Step 5: Replace usedSymbolIds / usedSymbols with split sets

Find these two lines after `visiblePlacements`:
```typescript
const usedSymbolIds = new Set(visiblePlacements.map((p) => p.href));
const usedSymbols = RELIEF_SYMBOLS.filter((sym) => usedSymbolIds.has(sym.id));
```

Replace with:
```typescript
/** Azgaar symbol defs — only unmapped terrain types (dune, swamp, etc.) */
const usedAzgaarHrefs = new Set(
    visiblePlacements.map((p) => p.href).filter((h) => !h.startsWith('custom-'))
);
const usedAzgaarSymbols = RELIEF_SYMBOLS.filter((sym) => usedAzgaarHrefs.has(sym.id));

/** Custom image symbol defs — one per type+variant */
const customSymbolDefs = Object.entries(CUSTOM_RELIEF_SYMBOLS).flatMap(([type, paths]) =>
    paths.map((path, idx) => ({ id: `custom-${type}-${idx + 1}`, href: path }))
);
```

### Step 6: Replace the JSX defs block

Find the `<defs>` section in the component return. Replace it with:

```tsx
<defs>
    {customSymbolDefs.map((sym) => (
        <symbol key={sym.id} id={sym.id} viewBox="0 0 200 200">
            <image href={sym.href} width="200" height="200" />
        </symbol>
    ))}
    {usedAzgaarSymbols.map((sym) => (
        <symbol key={sym.id} id={sym.id} viewBox={sym.viewBox}>
            {/* Keep existing eslint-disable comment for trusted Azgaar SVG content */}
            <g dangerouslySetInnerHTML={{ __html: sym.content }} />
        </symbol>
    ))}
</defs>
```

Note: The `dangerouslySetInnerHTML` here is unchanged from the original — it only applies to the Azgaar symbols (unmapped terrain types like dune/swamp), which are trusted static data generated by our own build script, not user input.

### Step 7: Verify build

```bash
npm run build -- --webpack 2>&1 | grep -E "error|ReliefLayer|custom-relief"
```

Expected: no output (no errors).

### Step 8: Commit

```bash
git add src/app/components/map/ReliefLayer.tsx
git commit -m "feat(map): use custom hand-drawn icons + increase relief icon sizes"
```

---

## Task 7: Visual verification + tuning

### Step 1: Start dev server

```bash
npm run dev
```

Open `http://localhost:3000/map`.

### Step 2: Visual checklist

- [ ] Hand-drawn mountain icons visible and prominent in mountain regions
- [ ] Hill icons readable
- [ ] Three tree variants visible across forested areas
- [ ] Grass icons in grassland areas
- [ ] Unmapped types (dune, swamp, vulcan, etc.) still use Azgaar symbols
- [ ] No broken-image placeholders (would indicate missing PNGs)
- [ ] Sepia/brightness filter still harmonises icon colours
- [ ] Region hover/click/labels unaffected

### Step 3: Tune SIZE_SCALE if needed

If icons are too large or small, adjust values in `SIZE_SCALE` in `ReliefLayer.tsx` and reload. Then commit:

```bash
git add src/app/components/map/ReliefLayer.tsx
git commit -m "chore(map): tune relief icon size scales"
```

---

## File Summary

| Action | File |
|--------|------|
| Modify | `package.json` (+sharp devDep) |
| Create | `scripts/extract-icons.mjs` |
| Create | `scripts/icon-crops.json` (user fills coordinates) |
| Create (generated) | `public/map-icons/*.png` (18 files) |
| Create | `src/lib/custom-relief-symbols.ts` |
| Modify | `src/app/components/map/ReliefLayer.tsx` |

