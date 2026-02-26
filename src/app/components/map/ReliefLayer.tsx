'use client';

import { useState, useEffect } from 'react';
import { SVGOverlay, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MAP_CONFIG, REGION_BOUNDARIES } from '@/lib/map-data';
import { RELIEF_SYMBOLS, RELIEF_PLACEMENTS } from '@/lib/relief-data';
import { computeClearanceZones, type LabelBBox } from '@/lib/label-config';
import { CUSTOM_RELIEF_SYMBOLS } from '@/lib/custom-relief-symbols';

// ---------------------------------------------------------------------------
// Thinning & sizing — keep fewer icons so terrain is suggested rather than
// carpeted, matching a sparse Tolkien-style placement.
// ---------------------------------------------------------------------------

/** Fraction of icons to keep, by terrain type. */
const KEEP_RATE: Record<string, number> = {
	mount: 0.85,
	mountSnow: 0.85,
	hill: 1.0,
	conifer: 1.0,
	coniferSnow: 0.42,
	deciduous: 1.0,
	grass: 0.75,
	acacia: 1.0,
	palm: 1.0,
	dune: 1.0,
	swamp: 0.55,
	vulcan: 0.9,
	cactus: 0.45,
	deadTree: 1.0,
};

/** Size multiplier by terrain type. */
const SIZE_SCALE: Record<string, number> = {
	mount:       1.8,
	mountSnow:   1.8,
	hill:        1.4,
	conifer:     0.65,
	coniferSnow: 1.1,
	deciduous:   0.65,
	grass:       0.45,
	acacia:      0.65,
	palm:        0.65,
	deadTree:    0.65,
	dune:        0.6,
	swamp:       0.55,
	vulcan:      0.7,
	cactus:      0.5,
};

/** Maps Azgaar terrain type to custom hand-drawn icon type. */
const AZGAAR_TO_CUSTOM: Record<string, string> = {
	hill:        'hill',
	conifer:     'tree-b',
	coniferSnow: 'tree-b',
	deciduous:   'tree-a',
	acacia:      'tree-c',
	palm:        'tree-d',
	deadTree:    'tree-e',
	grass:       'grass',
};

/** Check whether a point falls inside any rotated-rect clearance zone. */
function isInClearanceZone(px: number, py: number, zones: LabelBBox[]): boolean {
	for (const zone of zones) {
		const rad = (-zone.angle * Math.PI) / 180;
		const cos = Math.cos(rad);
		const sin = Math.sin(rad);
		const dx = px - zone.cx;
		const dy = py - zone.cy;
		const localX = dx * cos - dy * sin;
		const localY = dx * sin + dy * cos;
		if (Math.abs(localX) < zone.halfW && Math.abs(localY) < zone.halfH) {
			return true;
		}
	}
	return false;
}

/** Pre-computed label clearance zones so icons don't crowd text. */
const clearanceZones = computeClearanceZones(2);

/** Ray-cast point-in-polygon test. Polygon is an array of [svgX, svgY] pairs. */
function pointInPolygon(px: number, py: number, poly: number[][]): boolean {
	let inside = false;
	for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
		const xi = poly[i][0], yi = poly[i][1];
		const xj = poly[j][0], yj = poly[j][1];
		if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
			inside = !inside;
		}
	}
	return inside;
}

/** Terrae Mortuae polygon rings in SVG coordinate space.
 *  GeoJSON coords are [lng, lat]; SVG = (lng*32, -lat*32).
 */
const TM_REGION_IDS = new Set(['state-4', 'state-5']);
const TM_POLYGONS: number[][][] = [];
for (const feature of REGION_BOUNDARIES.features) {
	if (!TM_REGION_IDS.has(feature.properties?.regionId)) continue;
	const geom = feature.geometry;
	let rings: number[][][] = [];
	if (geom.type === 'Polygon') {
		rings = [geom.coordinates[0] as number[][]];
	} else if (geom.type === 'MultiPolygon') {
		rings = (geom.coordinates as number[][][][]).map((p) => p[0]);
	}
	for (const ring of rings) {
		TM_POLYGONS.push(ring.map(([lng, lat]) => [lng * 32, -lat * 32]));
	}
}

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

function isInTerraeMoretuae(svgX: number, svgY: number): boolean {
	return TM_POLYGONS.some((poly) => pointInPolygon(svgX, svgY, poly));
}

/** Deterministic hash (0–1) from position so thinning is stable across renders. */
function posHash(x: number, y: number): number {
	const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
	return n - Math.floor(n);
}

/** Derive terrain type from href (e.g. "relief-mount-1" → "mount"). */
function hrefToType(href: string): string {
	return href.replace(/^relief-/, '').replace(/-\d+$/, '');
}

/** Pre-compute the filtered + resized placement list once at module load. */
const visiblePlacements = RELIEF_PLACEMENTS.map((p) => ({
	...p,
	type: hrefToType(p.href),
})).filter((p) => {
	const rate = KEEP_RATE[p.type] ?? 0.3;
	return posHash(p.x, p.y) < rate;
}).filter((p) => {
	const cx = p.x + p.w / 2;
	const cy = p.y + p.h / 2;
	return !isInClearanceZone(cx, cy, clearanceZones);
}).filter((p) => {
	const cx = p.x + p.w / 2;
	const cy = p.y + p.h / 2;
	return !isNearBorder(cx, cy);
}).map((p) => {
	const scale = SIZE_SCALE[p.type] ?? 0.6;
	const newW = p.w * scale;
	const newH = p.h * scale;
	const cx = p.x + p.w / 2;
	const cy = p.y + p.h / 2;

	const customType = AZGAAR_TO_CUSTOM[p.type];
	let href = p.href;
	if (customType) {
		const variantIdx = Math.floor(posHash(p.x, p.y) * 3) + 1;
		const LIVE_TREE_CUSTOM_TYPES = new Set(['tree-a', 'tree-b', 'tree-c', 'tree-d']);
		const effectiveType =
			LIVE_TREE_CUSTOM_TYPES.has(customType) && isInTerraeMoretuae(cx, cy)
				? 'tree-e'
				: customType;
		href = `custom-${effectiveType}-${variantIdx}`;
	}

	return { x: cx - newW / 2, y: cy - newH / 2, w: newW, h: newH, href };
}).reduce<Array<{ x: number; y: number; w: number; h: number; href: string }>>(
	(accepted, p) => {
		const pad = 1.0; // minimum gap between icon edges in SVG units
		const pL = p.x - pad, pR = p.x + p.w + pad;
		const pT = p.y - pad, pB = p.y + p.h + pad;
		for (const a of accepted) {
			if (pR > a.x && pL < a.x + a.w && pB > a.y && pT < a.y + a.h) return accepted;
		}
		accepted.push(p);
		return accepted;
	},
	[]
);

/** Azgaar symbol defs — only unmapped terrain types (mount, dune, swamp, etc.) */
const usedAzgaarHrefs = new Set(
	visiblePlacements.map((p) => p.href).filter((h) => !h.startsWith('custom-'))
);
const usedAzgaarSymbols = RELIEF_SYMBOLS.filter((sym) => usedAzgaarHrefs.has(sym.id));

/** Custom image symbol defs — one per type + variant */
const customSymbolDefs = Object.entries(CUSTOM_RELIEF_SYMBOLS).flatMap(([type, paths]) =>
	paths.map((path, idx) => ({ id: `custom-${type}-${idx + 1}`, href: path }))
);

const ReliefLayer = () => {
	const map = useMap();
	const [paneReady, setPaneReady] = useState(false);

	useEffect(() => {
		if (!map.getPane('reliefPane')) {
			map.createPane('reliefPane');
		}
		const pane = map.getPane('reliefPane')!;
		pane.style.zIndex = '250';
		pane.style.filter = 'sepia(0.5) brightness(0.82)';
		setPaneReady(true);
	}, [map]);

	if (!paneReady || visiblePlacements.length === 0) return null;

	const bounds = L.latLngBounds(
		L.latLng(MAP_CONFIG.BOUNDS_SW[0], MAP_CONFIG.BOUNDS_SW[1]),
		L.latLng(MAP_CONFIG.BOUNDS_NE[0], MAP_CONFIG.BOUNDS_NE[1])
	);

	return (
		<SVGOverlay bounds={bounds} pane="reliefPane" interactive={false}>
			<svg viewBox={`0 0 ${MAP_CONFIG.SVG_WIDTH} ${MAP_CONFIG.SVG_HEIGHT}`} preserveAspectRatio="none">
				<defs>
					{customSymbolDefs.map((sym) => (
						<symbol key={sym.id} id={sym.id} viewBox="0 0 200 200">
							<image href={sym.href} width="200" height="200" />
						</symbol>
					))}
					{usedAzgaarSymbols.map((sym) => (
						<symbol key={sym.id} id={sym.id} viewBox={sym.viewBox}>
							{/* eslint-disable-next-line react/no-danger -- trusted Azgaar-generated SVG symbol content */}
							<g dangerouslySetInnerHTML={{ __html: sym.content }} />
						</symbol>
					))}
				</defs>
				{visiblePlacements.map((p, i) => (
					<use
						key={i}
						x={p.x}
						y={p.y}
						width={p.w}
						height={p.h}
						href={`#${p.href}`}
					/>
				))}
			</svg>
		</SVGOverlay>
	);
};

export default ReliefLayer;
