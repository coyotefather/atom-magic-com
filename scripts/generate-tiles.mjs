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
// 2. Parse Azgaar .map file — find sections by pattern matching
// ---------------------------------------------------------------------------

/**
 * Reads the .map file once and locates all data sections by content patterns
 * rather than hardcoded line numbers, making it resilient to format changes.
 */
function parseMapFile() {
	const raw = readFileSync(mapPath, 'utf-8');
	const lines = raw.split(/\r?\n/);

	// --- SVG dimensions (always line 1, pipe-delimited metadata) ---
	const metaFields = lines[0].split('|');
	const svgW = parseInt(metaFields[4], 10);
	const svgH = parseInt(metaFields[5], 10);

	// --- Biome legend: pipe-delimited line containing biome names like "Marine" ---
	let biomeLegendLine = null;
	for (let i = 1; i < Math.min(lines.length, 20); i++) {
		if (/Marine.*Savanna.*Grassland/i.test(lines[i])) {
			biomeLegendLine = i;
			break;
		}
	}
	if (biomeLegendLine === null) throw new Error('Could not find biome legend line');

	// --- SVG line: contains <g id="viewbox" ---
	let svgLineIdx = null;
	for (let i = 0; i < lines.length; i++) {
		if (lines[i].includes('<g id="viewbox"')) {
			svgLineIdx = i;
			break;
		}
	}
	if (svgLineIdx === null) throw new Error('Could not find SVG viewbox line');

	// --- States JSON: array entries with "diplomacy" field ---
	let statesLineIdx = null;
	for (let i = 0; i < lines.length; i++) {
		if (/^\[.*"diplomacy"/.test(lines[i])) {
			statesLineIdx = i;
			break;
		}
	}
	if (statesLineIdx === null) throw new Error('Could not find states JSON line');

	// --- Burgs JSON: array starting with {} followed by entries with "capital" and "x" ---
	let burgsLineIdx = null;
	for (let i = 0; i < lines.length; i++) {
		if (/^\[\{\},\{.*"capital".*"x"/.test(lines[i])) {
			burgsLineIdx = i;
			break;
		}
	}
	if (burgsLineIdx === null) throw new Error('Could not find burgs JSON line');

	// --- Cell data arrays: comma-separated numbers after burgs line ---
	// Biome array: values in range 0..~12 (biome IDs)
	// State array: values matching state IDs (max = stateCount - 1)
	const statesData = JSON.parse(lines[statesLineIdx]);
	const stateCount = statesData.length;

	let cellBiomesIdx = null;
	let cellStatesIdx = null;

	for (let i = burgsLineIdx + 1; i < lines.length; i++) {
		const line = lines[i].trim();
		if (!line || !line.match(/^\d/)) continue;
		if (!line.includes(',')) continue;

		const values = line.split(',').map(Number);
		if (values.some(isNaN)) continue;

		const maxVal = Math.max(...values);

		// Biome array: first numeric array, max value < 20 (biome IDs are typically 0-12)
		if (cellBiomesIdx === null && maxVal <= 20 && maxVal >= 2) {
			cellBiomesIdx = i;
			continue;
		}

		// State array: max value matches stateCount - 1
		if (cellStatesIdx === null && maxVal === stateCount - 1) {
			cellStatesIdx = i;
			break;
		}
	}

	if (cellBiomesIdx === null) throw new Error('Could not find cell biomes array');
	if (cellStatesIdx === null) throw new Error('Could not find cell states array');

	console.log('=== Map File Structure ===');
	console.log('  Biome legend:  line ' + (biomeLegendLine + 1));
	console.log('  SVG viewbox:   line ' + (svgLineIdx + 1));
	console.log('  States JSON:   line ' + (statesLineIdx + 1));
	console.log('  Burgs JSON:    line ' + (burgsLineIdx + 1));
	console.log('  Cell biomes:   line ' + (cellBiomesIdx + 1));
	console.log('  Cell states:   line ' + (cellStatesIdx + 1));
	console.log('');

	return {
		lines,
		svgW,
		svgH,
		biomeLegendLine,
		svgLineIdx,
		statesLineIdx,
		burgsLineIdx,
		cellBiomesIdx,
		cellStatesIdx,
	};
}

// ---------------------------------------------------------------------------
// 3. Extract state boundaries and metadata
// ---------------------------------------------------------------------------

function extractRegions(mapData, imgW, imgH) {
	console.log('=== Region Extraction ===');
	const { lines, svgW, svgH, svgLineIdx, statesLineIdx } = mapData;
	console.log('SVG graph: ' + svgW + 'x' + svgH);
	console.log('PNG image: ' + imgW + 'x' + imgH);

	// --- State metadata ---
	const statesData = JSON.parse(lines[statesLineIdx]);
	const stateMap = new Map();
	for (const s of statesData) {
		if (s.cells > 0) {
			stateMap.set(s.i, { id: s.i, name: s.name, color: s.color });
		}
	}
	console.log('Found ' + stateMap.size + ' active states');

	// --- SVG path data for each state ---
	// Extract <path> elements with id="stateN" and d="..." (handles any attribute order)
	const svgLine = lines[svgLineIdx];
	const statePaths = new Map();
	const pathTagRegex = /<path\s[^>]*?id="state(\d+)"[^>]*>/g;
	let match;
	while ((match = pathTagRegex.exec(svgLine)) !== null) {
		const stateId = parseInt(match[1], 10);
		const tag = match[0];
		const dMatch = tag.match(/\sd="([^"]+)"/);
		if (dMatch) {
			statePaths.set(stateId, dMatch[1]);
		}
	}
	// Also try reversed order: d="..." before id="stateN"
	if (statePaths.size === 0) {
		const reversedRegex = /<path\s[^>]*?d="([^"]+)"[^>]*?id="state(\d+)"[^>]*>/g;
		while ((match = reversedRegex.exec(svgLine)) !== null) {
			statePaths.set(parseInt(match[2], 10), match[1]);
		}
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
		// Strip Z (close path) commands — ring closing is handled below
		const commands = d.replace(/Z/gi, '').match(/[ML][^ML]*/g);
		if (!commands) return rings;

		for (const cmd of commands) {
			const type = cmd[0];
			const nums = cmd.substring(1).trim().split(/[,\s]+/).filter(Boolean).map(Number);

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
// 4. Extract capital cities from Azgaar burg data
// ---------------------------------------------------------------------------

function extractCapitals(mapData, imgW, imgH) {
	console.log('\n=== Capital Extraction ===');
	const { lines, svgW, svgH, burgsLineIdx } = mapData;

	const divisor = Math.pow(2, maxZoom);
	const scaleX = imgW / svgW / divisor;
	const scaleY = imgH / svgH / divisor;

	const burgsData = JSON.parse(lines[burgsLineIdx]);
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
// 5. Extract biome data from Azgaar pack cells
// ---------------------------------------------------------------------------

function extractBiomes(mapData) {
	console.log('\n=== Biome Extraction ===');
	const { lines, biomeLegendLine, cellBiomesIdx, cellStatesIdx } = mapData;

	// --- Biome legend ---
	// Format: colors|heights|names (all comma-separated, pipe-delimited)
	const biomeParts = lines[biomeLegendLine].split('|');
	const biomeColors = biomeParts[0].split(',');
	const biomeHeights = biomeParts[1] ? biomeParts[1].split(',').map(Number) : [];
	const biomeNames = biomeParts[2].split(',');
	// Normalize heights to 0-100 range
	const maxHeight = Math.max(1, ...biomeHeights.filter((h) => !isNaN(h)));
	const biomeLegend = biomeNames.map((name, i) => ({
		id: i,
		name: name,
		color: biomeColors[i] || '#888',
		height: biomeHeights[i] != null ? Math.round((biomeHeights[i] / maxHeight) * 100) : 0,
	}));
	console.log('Biome legend: ' + biomeLegend.length + ' types');

	// --- Pack cell arrays ---
	const cellBiomes = lines[cellBiomesIdx].split(',').map(Number);
	const cellStates = lines[cellStatesIdx].split(',').map(Number);

	if (cellBiomes.length !== cellStates.length) {
		console.warn('Warning: biome array (' + cellBiomes.length + ') and state array (' + cellStates.length + ') lengths differ');
	}

	const count = Math.min(cellBiomes.length, cellStates.length);
	console.log('Pack cells: ' + count);

	// --- Cross-reference to get biome distribution per state ---
	const stateBiomeCounts = new Map(); // stateId → Map<biomeId, count>

	for (let i = 0; i < count; i++) {
		const stateId = cellStates[i];
		const biomeId = cellBiomes[i];
		if (stateId === 0) continue; // skip neutral/unassigned

		if (!stateBiomeCounts.has(stateId)) {
			stateBiomeCounts.set(stateId, new Map());
		}
		const biomeMap = stateBiomeCounts.get(stateId);
		biomeMap.set(biomeId, (biomeMap.get(biomeId) || 0) + 1);
	}

	// --- Convert to percentages, keep top 5, drop < 2% ---
	const regionBiomes = [];

	for (const [stateId, biomeMap] of stateBiomeCounts) {
		const total = [...biomeMap.values()].reduce((a, b) => a + b, 0);
		const biomes = [...biomeMap.entries()]
			.map(([biomeId, cnt]) => ({
				biomeId,
				percentage: Math.round((cnt / total) * 100),
			}))
			.filter((b) => b.percentage >= 2)
			.sort((a, b) => b.percentage - a.percentage)
			.slice(0, 5);

		regionBiomes.push({
			regionId: 'state-' + stateId,
			biomes,
			dominantBiome: biomes[0]?.biomeId ?? 0,
		});

		const dominant = biomeLegend[biomes[0]?.biomeId]?.name ?? 'unknown';
		console.log('  state-' + stateId + ': ' + dominant + ' (' + biomes[0]?.percentage + '%) + ' + (biomes.length - 1) + ' others');
	}

	return { biomeLegend, regionBiomes };
}

// ---------------------------------------------------------------------------
// 6. Generate ocean bathymetric contour lines
// ---------------------------------------------------------------------------

function generateOceanContours(geojson) {
	console.log('\n=== Ocean Contour Generation ===');
	const OFFSETS = [3, 7, 12, 18]; // CRS units from coastline

	// Compute signed area to determine winding direction
	function signedArea(ring) {
		let area = 0;
		for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
			area += (ring[j][0] - ring[i][0]) * (ring[j][1] + ring[i][1]);
		}
		return area / 2;
	}

	// Line-line intersection of two infinite lines defined by points
	function lineIntersection(p1, p2, p3, p4) {
		const d1x = p2[0] - p1[0], d1y = p2[1] - p1[1];
		const d2x = p4[0] - p3[0], d2y = p4[1] - p3[1];
		const denom = d1x * d2y - d1y * d2x;
		if (Math.abs(denom) < 1e-10) return null; // parallel
		const t = ((p3[0] - p1[0]) * d2y - (p3[1] - p1[1]) * d2x) / denom;
		return [p1[0] + t * d1x, p1[1] + t * d1y];
	}

	// Offset a single ring outward by the given distance
	function offsetRing(ring, distance) {
		// Remove closing vertex for processing
		const pts = ring[ring.length - 1][0] === ring[0][0] && ring[ring.length - 1][1] === ring[0][1]
			? ring.slice(0, -1)
			: [...ring];
		const n = pts.length;
		if (n < 3) return null;

		const area = signedArea(pts);
		// Flip direction based on winding: we want outward = away from interior
		const dir = area < 0 ? 1 : -1;

		// Compute offset edge lines
		const offsetEdges = [];
		for (let i = 0; i < n; i++) {
			const j = (i + 1) % n;
			const dx = pts[j][0] - pts[i][0];
			const dy = pts[j][1] - pts[i][1];
			const len = Math.sqrt(dx * dx + dy * dy);
			if (len < 1e-10) continue;
			// Normal pointing outward
			const nx = dir * dy / len;
			const ny = dir * -dx / len;
			offsetEdges.push({
				p1: [pts[i][0] + distance * nx, pts[i][1] + distance * ny],
				p2: [pts[j][0] + distance * nx, pts[j][1] + distance * ny],
			});
		}

		if (offsetEdges.length < 3) return null;

		// Find intersection of consecutive offset edges
		const result = [];
		for (let i = 0; i < offsetEdges.length; i++) {
			const j = (i + 1) % offsetEdges.length;
			const inter = lineIntersection(
				offsetEdges[i].p1, offsetEdges[i].p2,
				offsetEdges[j].p1, offsetEdges[j].p2
			);

			if (inter) {
				// Miter limit: if the intersection is too far from both edge endpoints,
				// it means a sharp concave spike — use bevel instead
				const midX = (offsetEdges[i].p2[0] + offsetEdges[j].p1[0]) / 2;
				const midY = (offsetEdges[i].p2[1] + offsetEdges[j].p1[1]) / 2;
				const distSq = (inter[0] - midX) ** 2 + (inter[1] - midY) ** 2;
				if (distSq > (distance * 3) ** 2) {
					// Bevel: insert both edge endpoints instead of the miter point
					result.push([
						Math.round(offsetEdges[i].p2[0] * 100) / 100,
						Math.round(offsetEdges[i].p2[1] * 100) / 100,
					]);
					result.push([
						Math.round(offsetEdges[j].p1[0] * 100) / 100,
						Math.round(offsetEdges[j].p1[1] * 100) / 100,
					]);
				} else {
					result.push([
						Math.round(inter[0] * 100) / 100,
						Math.round(inter[1] * 100) / 100,
					]);
				}
			} else {
				// Parallel edges — use midpoint of endpoints
				result.push([
					Math.round(offsetEdges[i].p2[0] * 100) / 100,
					Math.round(offsetEdges[i].p2[1] * 100) / 100,
				]);
			}
		}

		if (result.length < 3) return null;

		// Close the ring
		result.push([result[0][0], result[0][1]]);
		return result;
	}

	// Build contour features: one MultiLineString per depth level
	const features = [];

	for (let depth = 0; depth < OFFSETS.length; depth++) {
		const distance = OFFSETS[depth];
		const lines = [];

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
				if (ring.length < 4) continue; // need at least 3 unique points + closing
				const offset = offsetRing(ring, distance);
				if (offset && offset.length >= 4) {
					lines.push(offset);
				}
			}
		}

		if (lines.length > 0) {
			features.push({
				type: 'Feature',
				properties: { depth: depth + 1 },
				geometry: {
					type: 'MultiLineString',
					coordinates: lines,
				},
			});
			const totalVerts = lines.reduce((sum, l) => sum + l.length, 0);
			console.log('  Depth ' + (depth + 1) + ' (offset ' + distance + '): ' + lines.length + ' contours, ' + totalVerts + ' vertices');
		}
	}

	console.log('Generated ' + features.length + ' contour depth levels');
	return { type: 'FeatureCollection', features };
}

// ---------------------------------------------------------------------------
// 7. Write src/lib/map-data.ts
// ---------------------------------------------------------------------------

function writeMapData({ regions, geojson, capitals, biomeLegend, regionBiomes, oceanContours, imgW, imgH }) {
	const divisor = Math.pow(2, maxZoom);
	const boundsSwLat = (-imgH / divisor).toFixed(4);
	const boundsNeLng = (imgW / divisor).toFixed(4);

	const regionsStr = JSON.stringify(regions, null, '\t');
	const geojsonStr = JSON.stringify(geojson);
	const capitalsStr = JSON.stringify(capitals, null, '\t');
	const biomeLegendStr = JSON.stringify(biomeLegend, null, '\t');
	const regionBiomesStr = JSON.stringify(regionBiomes, null, '\t');
	const oceanContoursStr = JSON.stringify(oceanContours);

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
		'export interface BiomeInfo {',
		'\tid: number;',
		'\tname: string;',
		'\tcolor: string;',
		'\theight: number;',
		'}',
		'',
		'export interface RegionBiomeBreakdown {',
		'\tregionId: string;',
		'\tbiomes: { biomeId: number; percentage: number }[];',
		'\tdominantBiome: number;',
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
		' * Biome type legend — maps biome IDs to names and colors.',
		' */',
		'export const BIOME_LEGEND: BiomeInfo[] = ' + biomeLegendStr + ';',
		'',
		'/**',
		' * Biome distribution per region — top biomes by percentage.',
		' */',
		'export const REGION_BIOMES: RegionBiomeBreakdown[] = ' + regionBiomesStr + ';',
		'',
		'/**',
		' * GeoJSON FeatureCollection for region boundaries.',
		' * Generated from Azgaar state boundary SVG paths, scaled to CRS.Simple coordinates.',
		' */',
		'export const REGION_BOUNDARIES: FeatureCollection = ' + geojsonStr + ';',
		'',
		'/**',
		' * Ocean bathymetric contour lines — concentric rings radiating from coastlines.',
		' * Each feature is a MultiLineString at a given depth level (1 = closest to shore).',
		' */',
		'export const OCEAN_CONTOURS: FeatureCollection = ' + oceanContoursStr + ';',
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
	const mapData = parseMapFile();
	const data = extractRegions(mapData, imgW, imgH);
	const capitals = extractCapitals(mapData, imgW, imgH);
	const { biomeLegend, regionBiomes } = extractBiomes(mapData);
	const oceanContours = generateOceanContours(data.geojson);
	writeMapData({ ...data, capitals, biomeLegend, regionBiomes, oceanContours });

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
