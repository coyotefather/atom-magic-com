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

	// --- Coordinate transform: SVG -> CRS.Simple ---
	// No PNG scaling — map directly from SVG coordinates.
	// CRS.Simple: lng = svgX / divisor, lat = -svgY / divisor
	const divisor = Math.pow(2, maxZoom);
	const scaleX = 1 / divisor;
	const scaleY = 1 / divisor;

	function parseSvgPath(d) {
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

function generateOceanContours(geojson) {
	console.log('\n=== Ocean Contour Generation ===');
	const OFFSETS = [0.1, 0.22, 0.38, 0.56]; // CRS units (SVG-scale space is ~45x24)

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
		const dir = area < 0 ? 1 : -1;

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

function writeMapData({ regions, geojson, capitals, biomeLegend, regionBiomes, oceanContours, svgW, svgH }) {
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
// Main
// ---------------------------------------------------------------------------

function main() {
	const mapData = parseMapFile();
	const { svgW, svgH } = mapData;
	const data = extractRegions(mapData);
	const capitals = extractCapitals(mapData);
	const { biomeLegend, regionBiomes } = extractBiomes(mapData);
	const relief = extractRelief(mapData);
	const rivers = extractRivers(mapData);
	const lakes = extractLakes(mapData);
	const oceanContours = generateOceanContours(data.geojson);
	writeMapData({ ...data, capitals, biomeLegend, regionBiomes, oceanContours, svgW, svgH });
	writeReliefData(relief);
	writeRiverData(rivers);
	writeLakeData(lakes);

	console.log('\n=== Done! ===');
	console.log('Next steps:');
	console.log('1. Run `npm run dev` and navigate to /map');
	console.log('2. Add codexSlug values to MAP_REGIONS in src/lib/map-data.ts');
	console.log('   to link regions to Codex entries');
}

main();
