#!/usr/bin/env node

/**
 * Solum Map Builder
 *
 * Reads an Azgaar Fantasy Map Generator .map save file and generates:
 *   1. src/lib/map-data.ts   — region boundaries, capitals, biomes, ocean contours, config
 *   2. src/lib/relief-data.ts — relief symbol definitions + 6,680 placements
 *   3. src/lib/river-data.ts  — river SVG path data
 *
 * Usage:
 *   node scripts/generate-tiles.mjs <save.map> [--max-zoom 5]
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const positional = args.filter((a) => !a.startsWith('--'));
const mapPath = positional[0] ? resolve(positional[0]) : null;

function getArg(name, fallback) {
	const i = args.indexOf(name);
	return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
}

const maxZoom = parseInt(getArg('--max-zoom', '5'), 10);

if (!mapPath) {
	console.error('Usage: node scripts/generate-tiles.mjs <save.map> [--max-zoom 5]');
	console.error('');
	console.error('  <save.map>  Azgaar .map save file');
	// eslint-disable-next-line no-process-exit
	process.exit(1);
}

if (!existsSync(mapPath)) { console.error('Map file not found: ' + mapPath); process.exit(1); }

// ---------------------------------------------------------------------------
// 1. Parse Azgaar .map file — find sections by pattern matching
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

		if (cellBiomesIdx === null && maxVal <= 20 && maxVal >= 2) {
			cellBiomesIdx = i;
			continue;
		}

		if (cellStatesIdx === null && maxVal === stateCount - 1) {
			cellStatesIdx = i;
			break;
		}
	}

	if (cellBiomesIdx === null) throw new Error('Could not find cell biomes array');
	if (cellStatesIdx === null) throw new Error('Could not find cell states array');

	console.log('=== Map File Structure ===');
	console.log('  SVG dimensions: ' + svgW + 'x' + svgH);
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
// Helper: Parse SVG M/L path string → array of CRS.Simple coordinate rings
// (handles M and L commands only — for state boundary paths)
// ---------------------------------------------------------------------------

function parseSvgPath(d) {
	const divisor = Math.pow(2, maxZoom);
	const scaleX = 1 / divisor;
	const scaleY = 1 / divisor;

	const rings = [];
	let currentRing = null;
	const commands = d.replace(/Z/gi, '').match(/[ML][^ML]*/g);
	if (!commands) return rings;

	for (const cmd of commands) {
		const type = cmd[0];
		const nums = cmd.substring(1).trim().split(/[,\s]+/).filter(Boolean).map(Number);

		if (type === 'M') {
			if (currentRing && currentRing.length >= 3) {
				rings.push(currentRing);
			}
			currentRing = [];
		}

		for (let i = 0; i < nums.length; i += 2) {
			const svgX = nums[i];
			const svgY = nums[i + 1];
			currentRing.push([
				Math.round(svgX * scaleX * 10000) / 10000,
				Math.round(-svgY * scaleY * 10000) / 10000,
			]);
		}
	}

	if (currentRing && currentRing.length >= 3) {
		rings.push(currentRing);
	}

	for (const ring of rings) {
		const first = ring[0];
		const last = ring[ring.length - 1];
		if (first[0] !== last[0] || first[1] !== last[1]) {
			ring.push([first[0], first[1]]);
		}
	}

	return rings;
}

// ---------------------------------------------------------------------------
// Helper: Parse SVG path with Bezier curves → CRS.Simple coordinate rings
// Handles M, L, C (cubic bezier), Q (quadratic bezier), Z commands.
// For C/Q, uses only the curve endpoint (accurate enough for contour offsets).
// ---------------------------------------------------------------------------

function parseFeaturePath(d) {
	const divisor = Math.pow(2, maxZoom);
	const scaleX = 1 / divisor;
	const scaleY = 1 / divisor;

	const rings = [];
	let currentRing = [];

	function closeRing() {
		if (currentRing.length >= 3) {
			const first = currentRing[0];
			const last = currentRing[currentRing.length - 1];
			if (first[0] !== last[0] || first[1] !== last[1]) {
				currentRing.push([first[0], first[1]]);
			}
			rings.push(currentRing);
		}
		currentRing = [];
	}

	function toCRS(svgX, svgY) {
		return [
			Math.round(svgX * scaleX * 10000) / 10000,
			Math.round(-svgY * scaleY * 10000) / 10000,
		];
	}

	// Split path into command segments: each segment starts with a command letter
	const segments = d.match(/[MLCQZAmlcqza][^MLCQZAmlcqza]*/g);
	if (!segments) return rings;

	for (const seg of segments) {
		const cmd = seg[0].toUpperCase();
		const numStrs = seg.substring(1).trim().split(/[,\s]+/).filter(Boolean);
		const nums = numStrs.map(Number).filter((n) => !isNaN(n));

		if (cmd === 'Z') {
			closeRing();
		} else if (cmd === 'M') {
			if (currentRing.length >= 3) closeRing();
			else currentRing = [];
			// M moves to the first point; any additional pairs are implicit L
			for (let i = 0; i + 1 < nums.length; i += 2) {
				currentRing.push(toCRS(nums[i], nums[i + 1]));
			}
		} else if (cmd === 'L') {
			for (let i = 0; i + 1 < nums.length; i += 2) {
				currentRing.push(toCRS(nums[i], nums[i + 1]));
			}
		} else if (cmd === 'C') {
			// Cubic bezier: 6 numbers per segment (x1,y1, x2,y2, x,y)
			// Use only the endpoint (every 3rd pair starting at index 4)
			for (let i = 4; i + 1 < nums.length; i += 6) {
				currentRing.push(toCRS(nums[i], nums[i + 1]));
			}
		} else if (cmd === 'Q') {
			// Quadratic bezier: 4 numbers per segment (x1,y1, x,y)
			// Use only the endpoint (every 2nd pair starting at index 2)
			for (let i = 2; i + 1 < nums.length; i += 4) {
				currentRing.push(toCRS(nums[i], nums[i + 1]));
			}
		}
		// Ignore A (arc) and other commands — rare in Azgaar outputs
	}

	if (currentRing.length >= 3) closeRing();

	return rings;
}

// ---------------------------------------------------------------------------
// 2. Extract state boundaries and metadata
// ---------------------------------------------------------------------------

function extractRegions(mapData) {
	console.log('=== Region Extraction ===');
	const { lines, svgW, svgH, svgLineIdx, statesLineIdx } = mapData;
	console.log('SVG dimensions: ' + svgW + 'x' + svgH);

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
	if (statePaths.size === 0) {
		const reversedRegex = /<path\s[^>]*?d="([^"]+)"[^>]*?id="state(\d+)"[^>]*>/g;
		while ((match = reversedRegex.exec(svgLine)) !== null) {
			statePaths.set(parseInt(match[2], 10), match[1]);
		}
	}
	console.log('Found ' + statePaths.size + ' state boundary paths\n');

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

	return { regions, geojson: { type: 'FeatureCollection', features } };
}

// ---------------------------------------------------------------------------
// 2b. Extract unified coastline rings from <g id="coastline">
// ---------------------------------------------------------------------------

function extractCoastline(mapData) {
	console.log('\n=== Coastline Extraction ===');
	const { lines, svgLineIdx } = mapData;
	const svgLine = lines[svgLineIdx];

	// Build feature path lookup (same technique as extractLakes)
	const featurePaths = new Map();
	for (let i = 0; i < lines.length; i++) {
		const featureRegex = /<path d="([^"]+)" id="(feature_\d+)" data-f="\d+"\/>/g;
		let m;
		while ((m = featureRegex.exec(lines[i])) !== null) {
			featurePaths.set(m[2], m[1]);
		}
	}
	console.log('Found ' + featurePaths.size + ' feature path definitions');

	const coastlineStart = svgLine.indexOf('<g id="coastline"');
	if (coastlineStart === -1) {
		console.warn('Warning: could not find <g id="coastline"> group');
		return [];
	}

	// Find the end of the coastline group by tracking nesting depth of <g> tags
	let depth = 0;
	let pos = coastlineStart;
	let coastlineEnd = -1;

	while (pos < svgLine.length) {
		const nextOpen = svgLine.indexOf('<g', pos);
		const nextClose = svgLine.indexOf('</g>', pos);

		if (nextClose === -1) break;

		if (nextOpen !== -1 && nextOpen < nextClose) {
			// Opening <g tag found before next close — check if self-closing
			const tagEnd = svgLine.indexOf('>', nextOpen);
			if (tagEnd !== -1 && svgLine[tagEnd - 1] !== '/') {
				depth++;
			}
			pos = tagEnd !== -1 ? tagEnd + 1 : nextOpen + 2;
		} else {
			// Closing </g> found first
			depth--;
			if (depth === 0) {
				coastlineEnd = nextClose + 4;
				break;
			}
			pos = nextClose + 4;
		}
	}

	if (coastlineEnd === -1) {
		console.warn('Warning: could not find end of coastline group');
		return [];
	}

	const coastlineContent = svgLine.substring(coastlineStart, coastlineEnd);

	// Extract <use href="#feature_N"> references and parse each feature path
	const allRings = [];
	const useRegex = /href="#(feature_\d+)"/g;
	let match;
	while ((match = useRegex.exec(coastlineContent)) !== null) {
		const featureId = match[1];
		const pathD = featurePaths.get(featureId);
		if (pathD) {
			const rings = parseFeaturePath(pathD);
			allRings.push(...rings);
		} else {
			console.warn('  Warning: no path found for ' + featureId);
		}
	}

	console.log('Found ' + allRings.length + ' coastline rings');
	return allRings;
}

// ---------------------------------------------------------------------------
// 2c. Extract biome geometry paths from <g id="biomes">
// ---------------------------------------------------------------------------

function extractBiomeGeometry(mapData) {
	console.log('\n=== Biome Geometry Extraction ===');
	const { lines, svgLineIdx } = mapData;
	const svgLine = lines[svgLineIdx];

	// Azgaar biome fill color → warm antique palette
	const AZGAAR_TO_WARM = {
		'#53679f': 'transparent', // Marine — skip (ocean background handles this)
		'#fbe79f': '#D4C87A',     // Hot desert
		'#b5b887': '#C8BA88',     // Cold desert
		'#d2d082': '#C8C49A',     // Savanna
		'#c8d68f': '#C4C490',     // Grassland
		'#b6d95d': '#A8B07A',     // Tropical seasonal forest
		'#29bc56': '#9EA878',     // Temperate deciduous forest
		'#7dcb35': '#A0AA72',     // Tropical rain forest
		'#45b348': '#9CA876',     // Temperate rain forest
		'#4b6b32': '#A0A87A',     // Taiga
		'#96784b': '#C0B890',     // Tundra
		'#d5e7eb': '#E4E0D0',     // Glacier
		'#0b9131': '#8E9870',     // Wetland
	};
	const DEFAULT_WARM = '#D0C98A';

	const biomesStart = svgLine.indexOf('<g id="biomes"');
	if (biomesStart === -1) {
		console.warn('Warning: could not find <g id="biomes"> group');
		return [];
	}

	const biomesEnd = svgLine.indexOf('</g>', biomesStart);
	const biomesContent = svgLine.substring(biomesStart, biomesEnd);

	const biomePaths = [];

	// Try d-attribute-first ordering
	const pathRegex = /<path[^>]*\sd="([^"]+)"[^>]*\sfill="([^"]+)"[^>]*/g;
	let match;
	while ((match = pathRegex.exec(biomesContent)) !== null) {
		const d = match[1];
		const azgaarFill = match[2].toLowerCase();
		const warmFill = AZGAAR_TO_WARM[azgaarFill] ?? DEFAULT_WARM;
		if (warmFill === 'transparent') continue;
		biomePaths.push({ d, fill: warmFill });
	}

	// Try fill-attribute-first ordering if nothing found
	if (biomePaths.length === 0) {
		const pathRegex2 = /<path[^>]*\sfill="([^"]+)"[^>]*\sd="([^"]+)"[^>]*/g;
		while ((match = pathRegex2.exec(biomesContent)) !== null) {
			const azgaarFill = match[1].toLowerCase();
			const d = match[2];
			const warmFill = AZGAAR_TO_WARM[azgaarFill] ?? DEFAULT_WARM;
			if (warmFill === 'transparent') continue;
			biomePaths.push({ d, fill: warmFill });
		}
	}

	console.log('Found ' + biomePaths.length + ' biome paths');
	return biomePaths;
}

// ---------------------------------------------------------------------------
// 3. Extract capital cities from Azgaar burg data
// ---------------------------------------------------------------------------

function extractCapitals(mapData) {
	console.log('\n=== Capital Extraction ===');
	const { lines, burgsLineIdx } = mapData;

	const divisor = Math.pow(2, maxZoom);
	const scaleX = 1 / divisor;
	const scaleY = 1 / divisor;

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
// 3b. Extract all cities from Azgaar burg data
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

// ---------------------------------------------------------------------------
// 4. Extract biome data from Azgaar pack cells
// ---------------------------------------------------------------------------

function extractBiomes(mapData) {
	console.log('\n=== Biome Extraction ===');
	const { lines, biomeLegendLine, cellBiomesIdx, cellStatesIdx } = mapData;

	const biomeParts = lines[biomeLegendLine].split('|');
	const biomeColors = biomeParts[0].split(',');
	const biomeHeights = biomeParts[1] ? biomeParts[1].split(',').map(Number) : [];
	const biomeNames = biomeParts[2].split(',');
	const maxHeight = Math.max(1, ...biomeHeights.filter((h) => !isNaN(h)));
	const biomeLegend = biomeNames.map((name, i) => ({
		id: i,
		name: name,
		color: biomeColors[i] || '#888',
		height: biomeHeights[i] != null ? Math.round((biomeHeights[i] / maxHeight) * 100) : 0,
	}));
	console.log('Biome legend: ' + biomeLegend.length + ' types');

	const cellBiomes = lines[cellBiomesIdx].split(',').map(Number);
	const cellStates = lines[cellStatesIdx].split(',').map(Number);

	if (cellBiomes.length !== cellStates.length) {
		console.warn('Warning: biome array (' + cellBiomes.length + ') and state array (' + cellStates.length + ') lengths differ');
	}

	const count = Math.min(cellBiomes.length, cellStates.length);
	console.log('Pack cells: ' + count);

	const stateBiomeCounts = new Map();

	for (let i = 0; i < count; i++) {
		const stateId = cellStates[i];
		const biomeId = cellBiomes[i];
		if (stateId === 0) continue;

		if (!stateBiomeCounts.has(stateId)) {
			stateBiomeCounts.set(stateId, new Map());
		}
		const biomeMap = stateBiomeCounts.get(stateId);
		biomeMap.set(biomeId, (biomeMap.get(biomeId) || 0) + 1);
	}

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
// 5. Extract relief symbol definitions and placements
// ---------------------------------------------------------------------------

function extractRelief(mapData) {
	console.log('\n=== Relief Extraction ===');
	const { lines, svgLineIdx } = mapData;
	const svgLine = lines[svgLineIdx];

	// --- Extract <symbol id="relief-*"> definitions ---
	// Symbols span multiple lines in the .map file (not on the SVG viewbox line).
	// Join all lines that contain relief symbol definitions.
	const symbols = [];
	let inReliefSymbol = false;
	let currentId = '';
	let currentViewBox = '';
	let currentContent = '';

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		if (!inReliefSymbol) {
			const openMatch = line.match(/<symbol\s+id="(relief-[^"]+)"\s+viewBox="([^"]+)">/);
			if (openMatch) {
				inReliefSymbol = true;
				currentId = openMatch[1];
				currentViewBox = openMatch[2];
				currentContent = '';
				// Check if the closing tag is on the same line
				const closeIdx = line.indexOf('</symbol>', openMatch.index);
				if (closeIdx > -1) {
					const afterOpen = line.substring(openMatch.index + openMatch[0].length, closeIdx);
					symbols.push({ id: currentId, viewBox: currentViewBox, content: afterOpen.trim() });
					inReliefSymbol = false;
				}
			}
		} else {
			const closeIdx = line.indexOf('</symbol>');
			if (closeIdx > -1) {
				currentContent += line.substring(0, closeIdx);
				symbols.push({ id: currentId, viewBox: currentViewBox, content: currentContent.trim() });
				inReliefSymbol = false;
			} else {
				currentContent += line;
			}
		}
	}

	console.log('Found ' + symbols.length + ' relief symbol definitions');

	// --- Extract <use> placements from <g id="terrain"> ---
	const terrainStart = svgLine.indexOf('<g id="terrain"');
	if (terrainStart === -1) {
		console.warn('Warning: could not find <g id="terrain"> group');
		return { symbols: [], placements: [] };
	}

	const terrainEnd = svgLine.indexOf('</g>', terrainStart);
	const terrainContent = svgLine.substring(terrainStart, terrainEnd);

	const placements = [];
	const useRegex = /<use\s+x="([^"]+)"\s+y="([^"]+)"\s+width="([^"]+)"\s+height="([^"]+)"\s+href="#([^"]+)"/g;
	let match;
	while ((match = useRegex.exec(terrainContent)) !== null) {
		placements.push({
			x: parseFloat(match[1]),
			y: parseFloat(match[2]),
			w: parseFloat(match[3]),
			h: parseFloat(match[4]),
			href: match[5],
		});
	}
	console.log('Found ' + placements.length + ' relief placements');

	// Log breakdown by type
	const typeCounts = new Map();
	for (const p of placements) {
		const type = p.href.replace(/-\d+$/, '');
		typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
	}
	for (const [type, count] of [...typeCounts.entries()].sort((a, b) => b[1] - a[1])) {
		console.log('  ' + type + ': ' + count);
	}

	return { symbols, placements };
}

// ---------------------------------------------------------------------------
// 6. Extract river paths
// ---------------------------------------------------------------------------

function extractRivers(mapData) {
	console.log('\n=== River Extraction ===');
	const { lines, svgLineIdx } = mapData;
	const svgLine = lines[svgLineIdx];

	const riversStart = svgLine.indexOf('<g id="rivers"');
	if (riversStart === -1) {
		console.warn('Warning: could not find <g id="rivers"> group');
		return [];
	}

	const riversEnd = svgLine.indexOf('</g>', riversStart);
	const riversContent = svgLine.substring(riversStart, riversEnd);

	const rivers = [];
	const pathRegex = /<path\s+d="([^"]+)"\s+id="([^"]+)"\s+data-width="([^"]+)"\s+data-increment="([^"]+)"/g;
	let match;
	while ((match = pathRegex.exec(riversContent)) !== null) {
		rivers.push({
			d: match[1],
			id: match[2],
			width: parseFloat(match[3]),
		});
	}

	console.log('Found ' + rivers.length + ' rivers');

	return rivers;
}

// ---------------------------------------------------------------------------
// 7. Extract lake polygons
// ---------------------------------------------------------------------------

function extractLakes(mapData) {
	console.log('\n=== Lake Extraction ===');
	const { lines, svgLineIdx } = mapData;
	const svgLine = lines[svgLineIdx];

	// --- Find feature path definitions ---
	// Features are <path d="..." id="feature_N" data-f="N"/> elements
	// on the line containing mask/defs (not the SVG viewbox line itself).
	const featurePaths = new Map();
	for (let i = 0; i < lines.length; i++) {
		const featureRegex = /<path d="([^"]+)" id="(feature_\d+)" data-f="\d+"\/>/g;
		let m;
		while ((m = featureRegex.exec(lines[i])) !== null) {
			featurePaths.set(m[2], m[1]);
		}
	}
	console.log('Found ' + featurePaths.size + ' feature path definitions');

	// --- Parse lake groups from SVG ---
	// <g id="lakes"> contains sub-groups: freshwater, salt, sinkhole, frozen, lava, dry
	// Each sub-group has styling attributes and <use href="#feature_N"> references
	const lakesStart = svgLine.indexOf('<g id="lakes"');
	if (lakesStart === -1) {
		console.warn('Warning: could not find <g id="lakes"> group');
		return [];
	}

	const lakeTypes = [
		{ id: 'freshwater', fill: '#a6c1fd', stroke: '#5f799d', opacity: 0.5 },
		{ id: 'frozen', fill: '#cdd4e7', stroke: '#cfe0eb', opacity: 0.95 },
		{ id: 'salt', fill: '#409b8a', stroke: '#388985', opacity: 0.5 },
		{ id: 'lava', fill: '#90270d', stroke: '#f93e0c', opacity: 0.7 },
		{ id: 'dry', fill: '#c9bfa7', stroke: '#8e816f', opacity: 1 },
	];

	const lakes = [];
	for (const lakeType of lakeTypes) {
		const groupStart = svgLine.indexOf('<g id="' + lakeType.id + '"', lakesStart);
		if (groupStart === -1) continue;

		// Check if this is a self-closing group (no content)
		const tagEnd = svgLine.indexOf('>', groupStart);
		if (tagEnd === -1) continue;
		if (svgLine[tagEnd - 1] === '/') continue; // self-closing <g ... />

		// Find the closing </g> for this group
		const groupEnd = svgLine.indexOf('</g>', tagEnd);
		if (groupEnd === -1) continue;

		const groupContent = svgLine.substring(groupStart, groupEnd);

		// Extract <use> references
		const useRegex = /href="#(feature_\d+)"/g;
		let m;
		while ((m = useRegex.exec(groupContent)) !== null) {
			const featureId = m[1];
			const pathD = featurePaths.get(featureId);
			if (pathD) {
				lakes.push({
					id: featureId,
					type: lakeType.id,
					d: pathD,
					fill: lakeType.fill,
					stroke: lakeType.stroke,
					opacity: lakeType.opacity,
				});
				console.log('  ' + lakeType.id + ': ' + featureId + ' (' + pathD.length + ' chars)');
			}
		}
	}

	console.log('Found ' + lakes.length + ' lakes total');
	return lakes;
}

// ---------------------------------------------------------------------------
// 8. Generate ocean bathymetric contour lines
// ---------------------------------------------------------------------------

function generateOceanContours(coastlineRings) {
	console.log('\n=== Ocean Contour Generation (coastline-based) ===');
	// 12 concentric levels following unified coastline, not per-region borders
	const OFFSETS = [0.03, 0.07, 0.13, 0.22, 0.38, 0.62, 1.00, 1.55, 2.30, 3.25, 4.40, 5.80];

	function signedArea(ring) {
		let area = 0;
		for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
			area += (ring[j][0] - ring[i][0]) * (ring[j][1] + ring[i][1]);
		}
		return area / 2;
	}

	function lineIntersection(p1, p2, p3, p4) {
		const d1x = p2[0] - p1[0], d1y = p2[1] - p1[1];
		const d2x = p4[0] - p3[0], d2y = p4[1] - p3[1];
		const denom = d1x * d2y - d1y * d2x;
		if (Math.abs(denom) < 1e-10) return null;
		const t = ((p3[0] - p1[0]) * d2y - (p3[1] - p1[1]) * d2x) / denom;
		return [p1[0] + t * d1x, p1[1] + t * d1y];
	}

	function offsetRing(ring, distance) {
		const pts = ring[ring.length - 1][0] === ring[0][0] && ring[ring.length - 1][1] === ring[0][1]
			? ring.slice(0, -1)
			: [...ring];
		const n = pts.length;
		if (n < 3) return null;

		const area = signedArea(pts);
		const dir = area < 0 ? -1 : 1;

		const offsetEdges = [];
		for (let i = 0; i < n; i++) {
			const j = (i + 1) % n;
			const dx = pts[j][0] - pts[i][0];
			const dy = pts[j][1] - pts[i][1];
			const len = Math.sqrt(dx * dx + dy * dy);
			if (len < 1e-10) continue;
			const nx = dir * dy / len;
			const ny = dir * -dx / len;
			offsetEdges.push({
				p1: [pts[i][0] + distance * nx, pts[i][1] + distance * ny],
				p2: [pts[j][0] + distance * nx, pts[j][1] + distance * ny],
			});
		}

		if (offsetEdges.length < 3) return null;

		const result = [];
		for (let i = 0; i < offsetEdges.length; i++) {
			const j = (i + 1) % offsetEdges.length;
			const inter = lineIntersection(
				offsetEdges[i].p1, offsetEdges[i].p2,
				offsetEdges[j].p1, offsetEdges[j].p2
			);

			if (inter) {
				const midX = (offsetEdges[i].p2[0] + offsetEdges[j].p1[0]) / 2;
				const midY = (offsetEdges[i].p2[1] + offsetEdges[j].p1[1]) / 2;
				const distSq = (inter[0] - midX) ** 2 + (inter[1] - midY) ** 2;
				if (distSq > (distance * 3) ** 2) {
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
				result.push([
					Math.round(offsetEdges[i].p2[0] * 100) / 100,
					Math.round(offsetEdges[i].p2[1] * 100) / 100,
				]);
			}
		}

		if (result.length < 3) return null;
		result.push([result[0][0], result[0][1]]);
		return result;
	}

	const features = [];

	for (let depth = 0; depth < OFFSETS.length; depth++) {
		const distance = OFFSETS[depth];
		const contourLines = [];

		for (const ring of coastlineRings) {
			if (ring.length < 4) continue;
			const offset = offsetRing(ring, distance);
			if (offset && offset.length >= 4) {
				contourLines.push(offset);
			}
		}

		if (contourLines.length > 0) {
			features.push({
				type: 'Feature',
				properties: { depth: depth + 1 },
				geometry: {
					type: 'MultiLineString',
					coordinates: contourLines,
				},
			});
			const totalVerts = contourLines.reduce((sum, l) => sum + l.length, 0);
			console.log('  Depth ' + (depth + 1) + ' (offset ' + distance + '): ' + contourLines.length + ' contours, ' + totalVerts + ' vertices');
		}
	}

	console.log('Generated ' + features.length + ' contour depth levels');
	return { type: 'FeatureCollection', features };
}

// ---------------------------------------------------------------------------
// 8. Write src/lib/map-data.ts
// ---------------------------------------------------------------------------

function writeMapData({ regions, geojson, capitals, cities, biomeLegend, regionBiomes, oceanContours, svgW, svgH }) {
	const divisor = Math.pow(2, maxZoom);
	const boundsSwLat = (-svgH / divisor).toFixed(4);
	const boundsNeLng = (svgW / divisor).toFixed(4);

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
		'export interface MapCity {',
		'\ti: number;',
		'\tname: string;',
		'\tsvgX: number;',
		'\tsvgY: number;',
		'\tstateId: number;',
		'\tcapital: boolean;',
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
		'\tSVG_WIDTH: ' + svgW + ',',
		'\tSVG_HEIGHT: ' + svgH + ',',
		'\tMIN_ZOOM: 0,',
		'\tMAX_ZOOM: ' + maxZoom + ',',
		'\tDEFAULT_ZOOM: 3,',
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
		' * All cities (capitals + non-capitals) extracted from Azgaar burg data.',
		' */',
		'export const MAP_CITIES: MapCity[] = ' + JSON.stringify(cities) + ';',
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
// 9. Write src/lib/relief-data.ts
// ---------------------------------------------------------------------------

function writeReliefData({ symbols, placements }) {
	const tsLines = [
		'/**',
		' * Relief icon data extracted from Azgaar Fantasy Map Generator.',
		' * Generated by scripts/generate-tiles.mjs — do not edit by hand.',
		' */',
		'',
		'export interface ReliefSymbol {',
		'\tid: string;',
		'\tviewBox: string;',
		'\tcontent: string;',
		'}',
		'',
		'export interface ReliefPlacement {',
		'\tx: number;',
		'\ty: number;',
		'\tw: number;',
		'\th: number;',
		'\thref: string;',
		'}',
		'',
		'export const RELIEF_SYMBOLS: ReliefSymbol[] = ' + JSON.stringify(symbols, null, '\t') + ';',
		'',
		'export const RELIEF_PLACEMENTS: ReliefPlacement[] = ' + JSON.stringify(placements) + ';',
		'',
	];

	const outPath = resolve('src/lib/relief-data.ts');
	writeFileSync(outPath, tsLines.join('\n'), 'utf-8');
	console.log('Wrote ' + outPath + ' (' + symbols.length + ' symbols, ' + placements.length + ' placements)');
}

// ---------------------------------------------------------------------------
// 10. Write src/lib/river-data.ts
// ---------------------------------------------------------------------------

function writeRiverData(rivers) {
	const tsLines = [
		'/**',
		' * River path data extracted from Azgaar Fantasy Map Generator.',
		' * Generated by scripts/generate-tiles.mjs — do not edit by hand.',
		' */',
		'',
		'export interface RiverPath {',
		'\td: string;',
		'\tid: string;',
		'\twidth: number;',
		'}',
		'',
		'export const RIVER_PATHS: RiverPath[] = ' + JSON.stringify(rivers, null, '\t') + ';',
		'',
	];

	const outPath = resolve('src/lib/river-data.ts');
	writeFileSync(outPath, tsLines.join('\n'), 'utf-8');
	console.log('Wrote ' + outPath + ' (' + rivers.length + ' rivers)');
}

// ---------------------------------------------------------------------------
// 11b. Write src/lib/biome-data.ts
// ---------------------------------------------------------------------------

function writeBiomeData(biomePaths) {
	const tsLines = [
		'/**',
		' * Biome geometry paths extracted from Azgaar Fantasy Map Generator.',
		' * Generated by scripts/generate-tiles.mjs — do not edit by hand.',
		' * Paths are in SVG coordinate space (0 0 1438 755) — no transform needed for SVGOverlay.',
		' */',
		'',
		'export interface BiomePath {',
		'\td: string;',
		'\tfill: string;',
		'}',
		'',
		'export const BIOME_PATHS: BiomePath[] = ' + JSON.stringify(biomePaths, null, '\t') + ';',
		'',
	];

	const outPath = resolve('src/lib/biome-data.ts');
	writeFileSync(outPath, tsLines.join('\n'), 'utf-8');
	console.log('Wrote ' + outPath + ' (' + biomePaths.length + ' biome paths)');
}

// ---------------------------------------------------------------------------
// 12. Write src/lib/lake-data.ts
// ---------------------------------------------------------------------------

function writeLakeData(lakes) {
	const tsLines = [
		'/**',
		' * Lake polygon data extracted from Azgaar Fantasy Map Generator.',
		' * Generated by scripts/generate-tiles.mjs — do not edit by hand.',
		' */',
		'',
		'export interface LakePolygon {',
		'\tid: string;',
		'\ttype: string;',
		'\td: string;',
		'\tfill: string;',
		'\tstroke: string;',
		'\topacity: number;',
		'}',
		'',
		'export const LAKE_POLYGONS: LakePolygon[] = ' + JSON.stringify(lakes, null, '\t') + ';',
		'',
	];

	const outPath = resolve('src/lib/lake-data.ts');
	writeFileSync(outPath, tsLines.join('\n'), 'utf-8');
	console.log('Wrote ' + outPath + ' (' + lakes.length + ' lakes)');
}

// ---------------------------------------------------------------------------
// 13. Compute terrain density clusters from relief placements
// ---------------------------------------------------------------------------

function computeTerrainClusters(relief) {
	console.log('\n=== Terrain Cluster Analysis ===');
	const { placements } = relief;

	// Map dimensions
	const MAP_W = 1438;
	const MAP_H = 755;
	const CELL_SIZE = 60; // SVG units per grid cell
	const COLS = Math.ceil(MAP_W / CELL_SIZE); // ~18
	const ROWS = Math.ceil(MAP_H / CELL_SIZE); // ~10

	// Types eligible for clustering
	const CLUSTERABLE = new Set([
		'mount', 'mountSnow', 'hill', 'conifer', 'coniferSnow',
		'deciduous', 'acacia', 'palm',
	]);

	// Group placements by terrain type (strip variant number suffix)
	const byType = new Map();
	for (const p of placements) {
		const type = p.href.replace(/-\d+$/, '').replace(/^relief-/, '');
		if (!CLUSTERABLE.has(type)) continue;
		if (!byType.has(type)) byType.set(type, []);
		byType.get(type).push(p);
	}

	console.log('Clusterable types: ' + [...byType.keys()].join(', '));

	const allClusters = [];

	for (const [type, typePlacements] of byType) {
		// Grid-bin placements
		const grid = Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
		const gridPlacements = Array.from({ length: ROWS }, () =>
			Array.from({ length: COLS }, () => [])
		);

		for (const p of typePlacements) {
			const col = Math.min(Math.floor(p.x / CELL_SIZE), COLS - 1);
			const row = Math.min(Math.floor(p.y / CELL_SIZE), ROWS - 1);
			grid[row][col]++;
			gridPlacements[row][col].push(p);
		}

		// Compute density threshold from non-zero cells
		const nonZero = [];
		for (let r = 0; r < ROWS; r++) {
			for (let c = 0; c < COLS; c++) {
				if (grid[r][c] > 0) nonZero.push(grid[r][c]);
			}
		}

		if (nonZero.length === 0) continue;

		const mean = nonZero.reduce((a, b) => a + b, 0) / nonZero.length;
		const variance = nonZero.reduce((a, v) => a + (v - mean) ** 2, 0) / nonZero.length;
		const stddev = Math.sqrt(variance);
		const threshold = Math.max(2, mean + 0.25 * stddev);

		// Mark high-density cells
		const highDensity = Array.from({ length: ROWS }, () => new Array(COLS).fill(false));
		for (let r = 0; r < ROWS; r++) {
			for (let c = 0; c < COLS; c++) {
				if (grid[r][c] >= threshold) highDensity[r][c] = true;
			}
		}

		// Flood-fill adjacent high-density cells into cluster regions
		const visited = Array.from({ length: ROWS }, () => new Array(COLS).fill(false));
		const typeClusters = [];

		for (let r = 0; r < ROWS; r++) {
			for (let c = 0; c < COLS; c++) {
				if (!highDensity[r][c] || visited[r][c]) continue;

				// BFS flood-fill
				const queue = [[r, c]];
				visited[r][c] = true;
				const clusterCells = [];

				while (queue.length > 0) {
					const [cr, cc] = queue.shift();
					clusterCells.push([cr, cc]);

					// 4-connected neighbors
					for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
						const nr = cr + dr;
						const nc = cc + dc;
						if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS &&
							highDensity[nr][nc] && !visited[nr][nc]) {
							visited[nr][nc] = true;
							queue.push([nr, nc]);
						}
					}
				}

				// Compute weighted centroid and total count
				let totalCount = 0;
				let weightedX = 0;
				let weightedY = 0;

				for (const [cr, cc] of clusterCells) {
					const cellPlacements = gridPlacements[cr][cc];
					const count = cellPlacements.length;
					totalCount += count;
					for (const p of cellPlacements) {
						weightedX += p.x;
						weightedY += p.y;
					}
				}

				if (totalCount > 0) {
					typeClusters.push({
						type,
						cx: Math.round((weightedX / totalCount) * 10) / 10,
						cy: Math.round((weightedY / totalCount) * 10) / 10,
						count: totalCount,
					});
				}
			}
		}

		// Normalize scale per type: largest = 1.0, smallest = 0.4
		if (typeClusters.length > 0) {
			const counts = typeClusters.map((c) => c.count);
			const maxCount = Math.max(...counts);
			const minCount = Math.min(...counts);
			const range = maxCount - minCount;

			for (const cluster of typeClusters) {
				cluster.scale = range > 0
					? Math.round((0.4 + 0.6 * ((cluster.count - minCount) / range)) * 100) / 100
					: 1.0;
			}

			allClusters.push(...typeClusters);
			console.log('  ' + type + ': ' + typePlacements.length + ' placements -> ' +
				typeClusters.length + ' clusters (threshold=' + threshold.toFixed(1) + ')');
		}
	}

	console.log('Total clusters: ' + allClusters.length);
	return allClusters;
}

// ---------------------------------------------------------------------------
// 14. Write src/lib/cluster-placements.ts
// ---------------------------------------------------------------------------

function writeClusterData(clusters) {
	const tsLines = [
		'/**',
		' * Terrain cluster data computed from relief placement density analysis.',
		' * Generated by scripts/generate-tiles.mjs — do not edit by hand.',
		' */',
		'',
		'export interface TerrainCluster {',
		'\ttype: string;',
		'\tcx: number;',
		'\tcy: number;',
		'\tcount: number;',
		'\tscale: number;',
		'}',
		'',
		'export const TERRAIN_CLUSTERS: TerrainCluster[] = ' + JSON.stringify(clusters, null, '\t') + ';',
		'',
	];

	const outPath = resolve('src/lib/cluster-placements.ts');
	writeFileSync(outPath, tsLines.join('\n'), 'utf-8');
	console.log('Wrote ' + outPath + ' (' + clusters.length + ' clusters)');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
	const mapData = parseMapFile();
	const { svgW, svgH } = mapData;
	const data = extractRegions(mapData);
	const coastlineRings = extractCoastline(mapData);
	const biomePaths = extractBiomeGeometry(mapData);
	const capitals = extractCapitals(mapData);
	const cities = extractCities(mapData);
	const { biomeLegend, regionBiomes } = extractBiomes(mapData);
	const relief = extractRelief(mapData);
	const clusters = computeTerrainClusters(relief);
	const rivers = extractRivers(mapData);
	const lakes = extractLakes(mapData);
	const oceanContours = generateOceanContours(coastlineRings);
	writeMapData({ ...data, capitals, cities, biomeLegend, regionBiomes, oceanContours, svgW, svgH });
	writeReliefData(relief);
	writeRiverData(rivers);
	writeLakeData(lakes);
	writeClusterData(clusters);
	writeBiomeData(biomePaths);

	console.log('\n=== Done! ===');
	console.log('Next steps:');
	console.log('1. Run `npm run dev` and navigate to /map');
	console.log('2. Add codexSlug values to MAP_REGIONS in src/lib/map-data.ts');
	console.log('   to link regions to Codex entries');
}

main();
