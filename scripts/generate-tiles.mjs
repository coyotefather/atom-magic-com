#!/usr/bin/env node

/**
 * Tile Generation Script for Solum Map
 *
 * Slices a high-resolution PNG into a tile pyramid compatible with
 * Leaflet's TileLayer (/{z}/{x}/{y}.png format).
 *
 * Usage:
 *   node scripts/generate-tiles.mjs <input.png> [--output public/map/tiles] [--tile-size 256] [--max-zoom 4]
 *
 * The script:
 * 1. Reads the source image dimensions
 * 2. For each zoom level (0 to maxZoom):
 *    - Resizes the image so the full map fits into 2^z tiles on each axis
 *    - Slices into tile-sized squares and saves as {z}/{x}/{y}.png
 * 3. Outputs a summary of the generated tiles
 *
 * Zoom level 0 = the entire map in a single tile
 * Zoom level N = 2^N x 2^N grid of tiles
 */

import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import sharp from 'sharp';

// Parse arguments
const args = process.argv.slice(2);
const inputIndex = args.findIndex((a) => !a.startsWith('--'));
const inputPath = inputIndex >= 0 ? args[inputIndex] : null;

function getArg(name, fallback) {
	const i = args.indexOf(name);
	return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
}

const outputDir = resolve(getArg('--output', 'public/map/tiles'));
const tileSize = parseInt(getArg('--tile-size', '256'), 10);
const maxZoom = parseInt(getArg('--max-zoom', '4'), 10);

if (!inputPath) {
	console.error('Usage: node scripts/generate-tiles.mjs <input.png> [--output dir] [--tile-size 256] [--max-zoom 4]');
	process.exit(1);
}

const resolvedInput = resolve(inputPath);

if (!existsSync(resolvedInput)) {
	console.error(`Input file not found: ${resolvedInput}`);
	process.exit(1);
}

async function generateTiles() {
	const image = sharp(resolvedInput);
	const metadata = await image.metadata();
	const { width, height } = metadata;

	console.log(`Source image: ${width}x${height}`);
	console.log(`Tile size: ${tileSize}px`);
	console.log(`Max zoom: ${maxZoom}`);
	console.log(`Output: ${outputDir}`);
	console.log('');

	// Clean output directory
	if (existsSync(outputDir)) {
		rmSync(outputDir, { recursive: true });
	}

	let totalTiles = 0;

	for (let z = 0; z <= maxZoom; z++) {
		const tilesPerAxis = Math.pow(2, z);
		const scaledWidth = tilesPerAxis * tileSize;
		const scaledHeight = tilesPerAxis * tileSize;

		console.log(`Zoom ${z}: ${tilesPerAxis}x${tilesPerAxis} tiles (${scaledWidth}x${scaledHeight}px)`);

		// Resize the full image to fit this zoom level's grid.
		// Use 'contain' to preserve aspect ratio and pad with transparent/parchment.
		const resized = await sharp(resolvedInput)
			.resize(scaledWidth, scaledHeight, {
				fit: 'contain',
				background: { r: 245, g: 240, b: 225, alpha: 1 }, // parchment color
			})
			.png()
			.toBuffer();

		for (let x = 0; x < tilesPerAxis; x++) {
			for (let y = 0; y < tilesPerAxis; y++) {
				const left = x * tileSize;
				const top = y * tileSize;

				const tileDir = resolve(outputDir, `${z}`, `${x}`);
				mkdirSync(tileDir, { recursive: true });

				const tilePath = resolve(tileDir, `${y}.png`);

				await sharp(resized)
					.extract({
						left,
						top,
						width: tileSize,
						height: tileSize,
					})
					.png({ quality: 80, compressionLevel: 9 })
					.toFile(tilePath);

				totalTiles++;
			}
		}
	}

	console.log('');
	console.log(`Done! Generated ${totalTiles} tiles.`);
	console.log('');
	console.log('Next steps:');
	console.log(`1. Update MAP_CONFIG in src/lib/map-data.ts with IMAGE_WIDTH=${width}, IMAGE_HEIGHT=${height}`);
	console.log('2. Add region boundaries to REGION_BOUNDARIES in src/lib/map-data.ts');
	console.log('3. Run `npm run dev` and navigate to /map');
}

generateTiles().catch((err) => {
	console.error('Tile generation failed:', err);
	process.exit(1);
});
