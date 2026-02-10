#!/usr/bin/env node

/**
 * Solum Map Builder
 *
 * Reads an Azgaar Fantasy Map Generator .map save file and a high-res PNG export,
 * then generates:
 *   1. A tile pyramid (/{z}/{x}/{y}.png) for Leaflet
 *   2. A map-data.ts file with region boundaries and configuration
 *
 * Usage:
 *   node scripts/generate-tiles.mjs <map.png> <save.map> [--max-zoom 5] [--output public/map/tiles]
 *
 * The PNG and .map file should be exports from the same Azgaar map.
 */

import { existsSync, mkdirSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const positional = args.filter((a) => !a.startsWith('--'));
const pngPath = positional[0] ? resolve(positional[0]) : null;
const mapPath = positional[1] ? resolve(positional[1]) : null;

function getArg(name, fallback) {
	const i = args.indexOf(name);
	return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
}

const outputDir = resolve(getArg('--output', 'public/map/tiles'));
const tileSize = 256;
const maxZoom = parseInt(getArg('--max-zoom', '5'), 10);

if (!pngPath || !mapPath) {
	console.error('Usage: node scripts/generate-tiles.mjs <map.png> <save.map> [--max-zoom 5] [--output dir]');
	console.error('');
	console.error('  <map.png>   High-res PNG export from Azgaar');
	console.error('  <save.map>  Azgaar .map save file');
	process.exit(1);
}

if (!existsSync(pngPath)) { console.error('PNG not found: ' + pngPath); process.exit(1); }
if (!existsSync(mapPath)) { console.error('Map file not found: ' + mapPath); process.exit(1); }

// ---------------------------------------------------------------------------
// 1. Tile generation — non-square tile pyramid
// ---------------------------------------------------------------------------

async function generateTiles() {
	const metadata = await sharp(pngPath).metadata();
	const imgW = metadata.width;
	const imgH = metadata.height;

	console.log('\n=== Tile Generation ===');
	console.log('Source: ' + imgW + 'x' + imgH);
	console.log('Max zoom: ' + maxZoom);
	console.log('Output: ' + outputDir + '\n');

	if (existsSync(outputDir)) {
		rmSync(outputDir, { recursive: true });
	}

	let totalTiles = 0;

	for (let z = 0; z <= maxZoom; z++) {
		// At maxZoom, 1 tile pixel = 1 image pixel (native resolution).
		// At lower zooms, image is scaled down by 2^(maxZoom - z).
		const scale = Math.pow(2, z - maxZoom);
		const scaledW = Math.ceil(imgW * scale);
		const scaledH = Math.ceil(imgH * scale);
		const tilesX = Math.ceil(scaledW / tileSize);
		const tilesY = Math.ceil(scaledH / tileSize);

		// Resize and pad to fill last partial tiles
		const paddedW = tilesX * tileSize;
		const paddedH = tilesY * tileSize;

		console.log('Zoom ' + z + ': ' + tilesX + 'x' + tilesY + ' tiles (' + scaledW + 'x' + scaledH + 'px)');

		const resized = await sharp(pngPath)
			.resize(scaledW, scaledH)
			.extend({
				right: paddedW - scaledW,
				bottom: paddedH - scaledH,
				background: { r: 0, g: 0, b: 0, alpha: 0 },
			})
			.png()
			.toBuffer();

		for (let x = 0; x < tilesX; x++) {
			for (let y = 0; y < tilesY; y++) {
				const tileDir = resolve(outputDir, '' + z, '' + x);
				mkdirSync(tileDir, { recursive: true });

				await sharp(resized)
					.extract({
						left: x * tileSize,
						top: y * tileSize,
						width: tileSize,
						height: tileSize,
					})
					.png({ compressionLevel: 9 })
					.toFile(resolve(tileDir, y + '.png'));

				totalTiles++;
			}
		}
	}

	console.log('\nGenerated ' + totalTiles + ' tiles.\n');
	return { imgW, imgH };
}

// ---------------------------------------------------------------------------
// 2. Extract state boundaries and metadata from Azgaar .map file
// ---------------------------------------------------------------------------

function extractRegions(imgW, imgH) {
	console.log('=== Region Extraction ===');
	const raw = readFileSync(mapPath, 'utf-8');
	const lines = raw.split(/\r?\n/);

	// --- SVG dimensions (from metadata line 1, fields 4 and 5) ---
	const metaFields = lines[0].split('|');
	const svgW = parseInt(metaFields[4], 10);
	const svgH = parseInt(metaFields[5], 10);
	console.log('SVG graph: ' + svgW + 'x' + svgH);
	console.log('PNG image: ' + imgW + 'x' + imgH);

	// --- State metadata (JSON array on line 507, 0-indexed 506) ---
	const statesData = JSON.parse(lines[506]);
	const stateMap = new Map();
	for (const s of statesData) {
		if (s.cells > 0) {
			stateMap.set(s.i, { id: s.i, name: s.name, color: s.color });
		}
	}
	console.log('Found ' + stateMap.size + ' active states');

	// --- SVG path data for each state (embedded in SVG line) ---
	const svgLine = lines[494];
	const pathRegex = /id="state(\d+)"[^>]*d="([^"]+)"/g;
	let match;
	const statePaths = new Map();
	while ((match = pathRegex.exec(svgLine)) !== null) {
		statePaths.set(parseInt(match[1], 10), match[2]);
	}
	console.log('Found ' + statePaths.size + ' state boundary paths\n');

	// --- Coordinate transform: SVG → CRS.Simple ---
	//
	// CRS.Simple with unproject-based bounds:
	//   Pixel (px, py) at maxZoom → CRS latLng(-py / 2^maxZoom, px / 2^maxZoom)
	//   SW = latLng(-imgH / 2^maxZoom, 0)
	//   NE = latLng(0, imgW / 2^maxZoom)
	//
	// SVG → PNG pixel: px = svgX * imgW/svgW,  py = svgY * imgH/svgH
	// PNG pixel → CRS: lng = px / 2^maxZoom,   lat = -py / 2^maxZoom
	//
	// Combined: lng = svgX * imgW / (svgW * 2^maxZoom)
	//           lat = -svgY * imgH / (svgH * 2^maxZoom)

	const divisor = Math.pow(2, maxZoom);
	const scaleX = imgW / svgW / divisor;
	const scaleY = imgH / svgH / divisor;

	function parseSvgPath(d) {
		const rings = [];
		let currentRing = null;
		const commands = d.match(/[ML][^ML]*/g);
		if (!commands) return rings;

		for (const cmd of commands) {
			const type = cmd[0];
			const nums = cmd.substring(1).split(/[,\s]+/).map(Number);

			// M (moveto) starts a new ring — this is how SVG encodes
			// separate subpaths (e.g., islands vs mainland)
			if (type === 'M') {
				if (currentRing && currentRing.length >= 3) {
					rings.push(currentRing);
				}
				currentRing = [];
			}

			for (let i = 0; i < nums.length; i += 2) {
				const svgX = nums[i];
				const svgY = nums[i + 1];
				// GeoJSON: [longitude, latitude]
				currentRing.push([
					Math.round(svgX * scaleX * 10000) / 10000,
					Math.round(-svgY * scaleY * 10000) / 10000,
				]);
			}
		}

		// Push final ring
		if (currentRing && currentRing.length >= 3) {
			rings.push(currentRing);
		}

		// Close each ring if not already closed
		for (const ring of rings) {
			const first = ring[0];
			const last = ring[ring.length - 1];
			if (first[0] !== last[0] || first[1] !== last[1]) {
				ring.push([first[0], first[1]]);
			}
		}

		return rings;
	}

	// --- Build regions and GeoJSON features ---
	const regions = [];
	const features = [];

	for (const [stateId, meta] of stateMap) {
		const pathD = statePaths.get(stateId);
		if (!pathD) continue;

		const rings = parseSvgPath(pathD);
		if (rings.length === 0) continue;

		const region = {
			id: 'state-' + stateId,
			name: meta.name,
			description: '',
			color: meta.color,
		};
		regions.push(region);

		// 1 ring → Polygon, multiple rings → MultiPolygon
		const geometry = rings.length === 1
			? { type: 'Polygon', coordinates: [rings[0]] }
			: { type: 'MultiPolygon', coordinates: rings.map((r) => [r]) };

		features.push({
			type: 'Feature',
			properties: { regionId: region.id },
			geometry,
		});

		const totalVerts = rings.reduce((sum, r) => sum + r.length, 0);
		console.log('  ' + region.id + ': ' + meta.name + ' (' + totalVerts + ' vertices, ' + rings.length + ' ring' + (rings.length > 1 ? 's' : '') + ')');
	}

	return { regions, geojson: { type: 'FeatureCollection', features }, imgW, imgH };
}

// ---------------------------------------------------------------------------
// 3. Extract capital cities from Azgaar burg data
// ---------------------------------------------------------------------------

function extractCapitals(imgW, imgH) {
	console.log('\n=== Capital Extraction ===');
	const raw = readFileSync(mapPath, 'utf-8');
	const lines = raw.split(/\r?\n/);

	// SVG dimensions from metadata line 1
	const metaFields = lines[0].split('|');
	const svgW = parseInt(metaFields[4], 10);
	const svgH = parseInt(metaFields[5], 10);

	const divisor = Math.pow(2, maxZoom);
	const scaleX = imgW / svgW / divisor;
	const scaleY = imgH / svgH / divisor;

	// Burg data is on line 508 (0-indexed 507)
	const burgsData = JSON.parse(lines[507]);
	const capitals = [];

	for (const burg of burgsData) {
		if (!burg.capital || burg.removed) continue;
		capitals.push({
			id: burg.i,
			name: burg.name,
			stateId: burg.state,
			lng: Math.round(burg.x * scaleX * 10000) / 10000,
			lat: Math.round(-burg.y * scaleY * 10000) / 10000,
		});
	}

	console.log('Found ' + capitals.length + ' capital cities');
	for (const c of capitals) {
		console.log('  ' + c.name + ' (state ' + c.stateId + ')');
	}

	return capitals;
}

// ---------------------------------------------------------------------------
// 4. Write src/lib/map-data.ts
// ---------------------------------------------------------------------------

function writeMapData({ regions, geojson, capitals, imgW, imgH }) {
	const divisor = Math.pow(2, maxZoom);
	const boundsSwLat = (-imgH / divisor).toFixed(4);
	const boundsNeLng = (imgW / divisor).toFixed(4);

	const regionsStr = JSON.stringify(regions, null, '\t');
	const geojsonStr = JSON.stringify(geojson);
	const capitalsStr = JSON.stringify(capitals, null, '\t');

	const ts = [
		"import type { FeatureCollection } from 'geojson';",
		'',
		'export interface MapRegion {',
		'\tid: string;',
		'\tname: string;',
		'\tdescription: string;',
		'\tcodexSlug?: string;',
		'\tcolor: string;',
		'}',
		'',
		'export interface MapCapital {',
		'\tid: number;',
		'\tname: string;',
		'\tstateId: number;',
		'\tlat: number;',
		'\tlng: number;',
		'}',
		'',
		'/**',
		' * Map configuration for Solum.',
		' * Generated by scripts/generate-tiles.mjs — do not edit by hand.',
		' */',
		'export const MAP_CONFIG = {',
		'\tIMAGE_WIDTH: ' + imgW + ',',
		'\tIMAGE_HEIGHT: ' + imgH + ',',
		'\tMIN_ZOOM: 0,',
		'\tMAX_ZOOM: ' + maxZoom + ',',
		'\tDEFAULT_ZOOM: 2,',
		'\tTILE_SIZE: 256,',
		'\tBOUNDS_SW: [' + boundsSwLat + ', 0] as [number, number],',
		'\tBOUNDS_NE: [0, ' + boundsNeLng + '] as [number, number],',
		'};',
		'',
		'/**',
		' * Region metadata — maps region IDs to display info and Codex slugs.',
		' * Add codexSlug values to link regions to Codex entries.',
		' */',
		'export const MAP_REGIONS: MapRegion[] = ' + regionsStr + ';',
		'',
		'/**',
		' * Capital cities extracted from Azgaar burg data.',
		' */',
		'export const MAP_CAPITALS: MapCapital[] = ' + capitalsStr + ';',
		'',
		'/**',
		' * GeoJSON FeatureCollection for region boundaries.',
		' * Generated from Azgaar state boundary SVG paths, scaled to CRS.Simple coordinates.',
		' */',
		'export const REGION_BOUNDARIES: FeatureCollection = ' + geojsonStr + ';',
		'',
	].join('\n');

	const outPath = resolve('src/lib/map-data.ts');
	writeFileSync(outPath, ts, 'utf-8');
	console.log('\nWrote ' + outPath);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
	const { imgW, imgH } = await generateTiles();
	const data = extractRegions(imgW, imgH);
	const capitals = extractCapitals(imgW, imgH);
	writeMapData({ ...data, capitals });

	console.log('\n=== Done! ===');
	console.log('Next steps:');
	console.log('1. Run `npm run dev` and navigate to /map');
	console.log('2. Add codexSlug values to MAP_REGIONS in src/lib/map-data.ts');
	console.log('   to link regions to Codex entries');
}

main().catch((err) => {
	console.error('Build failed:', err);
	process.exit(1);
});
