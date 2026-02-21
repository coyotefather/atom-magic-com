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
