'use client';

import { useState, useEffect } from 'react';
import { SVGOverlay, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MAP_CONFIG } from '@/lib/map-data';
import { RELIEF_SYMBOLS, RELIEF_PLACEMENTS } from '@/lib/relief-data';
import { computeClearanceZones, type LabelBBox } from '@/lib/label-config';

// ---------------------------------------------------------------------------
// Tolkien-style SVG symbol content by type.
// Each type has multiple variants for organic feel. Symbols use viewBox 0 0 30 30.
// All content is black ink — peaked mountains with hatching, solid tree silhouettes,
// grass tufts, etc., matching Tolkien's hand-drawn cartographic style.
// Stroke weights kept light (0.4–1.2) for delicate pen-drawn appearance.
// ---------------------------------------------------------------------------

const TOLKIEN_VIEWBOX = '0 0 30 30';

const TOLKIEN_CONTENT: Record<string, string[]> = {
	// Mountains — peaked triangles with hatching lines on one side
	mount: [
		'<path d="M3,28 L15,3 L27,28" fill="none" stroke="black" stroke-width="1.2" stroke-linejoin="round"/><line x1="16" y1="7" x2="21" y2="19" stroke="black" stroke-width="0.5"/><line x1="17" y1="11" x2="23" y2="23" stroke="black" stroke-width="0.4"/><line x1="18" y1="15" x2="25" y2="26" stroke="black" stroke-width="0.35"/>',
		'<path d="M5,28 L13,3 L25,28" fill="none" stroke="black" stroke-width="1.2" stroke-linejoin="round"/><line x1="14" y1="7" x2="20" y2="21" stroke="black" stroke-width="0.5"/><line x1="15" y1="11" x2="22" y2="24" stroke="black" stroke-width="0.4"/><line x1="16" y1="15" x2="24" y2="27" stroke="black" stroke-width="0.3"/>',
		'<path d="M2,28 L14,4 L28,28" fill="none" stroke="black" stroke-width="1.1" stroke-linejoin="round"/><line x1="15" y1="8" x2="22" y2="22" stroke="black" stroke-width="0.5"/><line x1="16" y1="12" x2="24" y2="25" stroke="black" stroke-width="0.4"/><line x1="17" y1="16" x2="26" y2="27" stroke="black" stroke-width="0.3"/>',
		'<path d="M4,28 L16,2 L26,28" fill="none" stroke="black" stroke-width="1.2" stroke-linejoin="round"/><line x1="17" y1="6" x2="21" y2="17" stroke="black" stroke-width="0.5"/><line x1="18" y1="10" x2="23" y2="22" stroke="black" stroke-width="0.4"/><line x1="18" y1="14" x2="25" y2="26" stroke="black" stroke-width="0.3"/>',
	],
	// Snow-capped mountains — peak outline with snow cap line
	mountSnow: [
		'<path d="M3,28 L15,3 L27,28" fill="none" stroke="black" stroke-width="1.2" stroke-linejoin="round"/><line x1="10" y1="16" x2="20" y2="16" stroke="black" stroke-width="0.5"/><line x1="17" y1="14" x2="23" y2="24" stroke="black" stroke-width="0.4"/><line x1="18" y1="18" x2="25" y2="27" stroke="black" stroke-width="0.35"/>',
		'<path d="M4,28 L14,4 L26,28" fill="none" stroke="black" stroke-width="1.1" stroke-linejoin="round"/><line x1="9" y1="17" x2="19" y2="17" stroke="black" stroke-width="0.5"/><line x1="16" y1="15" x2="22" y2="25" stroke="black" stroke-width="0.4"/><line x1="17" y1="19" x2="24" y2="27" stroke="black" stroke-width="0.3"/>',
		'<path d="M5,28 L15,2 L25,28" fill="none" stroke="black" stroke-width="1.2" stroke-linejoin="round"/><line x1="10" y1="15" x2="20" y2="15" stroke="black" stroke-width="0.5"/><line x1="16" y1="13" x2="21" y2="22" stroke="black" stroke-width="0.4"/><line x1="17" y1="17" x2="23" y2="26" stroke="black" stroke-width="0.35"/>',
	],
	// Hills — rounded bumps with light hatching
	hill: [
		'<path d="M2,26 Q15,4 28,26" fill="none" stroke="black" stroke-width="1.0" stroke-linecap="round"/><line x1="16" y1="12" x2="22" y2="22" stroke="black" stroke-width="0.4"/><line x1="18" y1="16" x2="24" y2="24" stroke="black" stroke-width="0.35"/>',
		'<path d="M3,26 Q13,6 27,26" fill="none" stroke="black" stroke-width="0.9" stroke-linecap="round"/><line x1="15" y1="13" x2="21" y2="23" stroke="black" stroke-width="0.4"/><line x1="17" y1="17" x2="23" y2="25" stroke="black" stroke-width="0.3"/>',
		'<path d="M4,27 Q16,5 26,27" fill="none" stroke="black" stroke-width="1.0" stroke-linecap="round"/><line x1="17" y1="11" x2="22" y2="22" stroke="black" stroke-width="0.4"/><line x1="18" y1="15" x2="24" y2="25" stroke="black" stroke-width="0.3"/>',
	],
	// Conifers — small pointed tree outlines (not filled, lighter)
	conifer: [
		'<path d="M15,2 L10,14 L12,13 L8,23 L22,23 L18,13 L20,14 Z" fill="none" stroke="black" stroke-width="0.8"/><line x1="15" y1="23" x2="15" y2="28" stroke="black" stroke-width="0.8"/>',
		'<path d="M15,3 L11,13 L13,12 L9,21 L21,21 L17,12 L19,13 Z" fill="none" stroke="black" stroke-width="0.8"/><line x1="15" y1="21" x2="15" y2="27" stroke="black" stroke-width="0.8"/>',
	],
	// Snow conifers — outlined
	coniferSnow: [
		'<path d="M15,2 L9,14 L12,12 L7,24 L23,24 L18,12 L21,14 Z" fill="none" stroke="black" stroke-width="0.7"/><line x1="15" y1="24" x2="15" y2="28" stroke="black" stroke-width="0.7"/>',
	],
	// Deciduous — small rounded canopy outlines
	deciduous: [
		'<ellipse cx="15" cy="14" rx="9" ry="10" fill="none" stroke="black" stroke-width="0.8"/><line x1="15" y1="23" x2="15" y2="28" stroke="black" stroke-width="0.8"/>',
		'<ellipse cx="15" cy="13" rx="8" ry="9" fill="none" stroke="black" stroke-width="0.8"/><line x1="15" y1="21" x2="15" y2="28" stroke="black" stroke-width="0.8"/>',
		'<path d="M15,4 C8,4 4,9 4,15 C4,21 9,24 15,24 C21,24 26,21 26,15 C26,9 22,4 15,4 Z" fill="none" stroke="black" stroke-width="0.8"/><line x1="15" y1="23" x2="15" y2="28" stroke="black" stroke-width="0.8"/>',
	],
	// Grass — small curved strokes
	grass: [
		'<path d="M10,28 Q11,20 14,16" fill="none" stroke="black" stroke-width="0.7" stroke-linecap="round"/><path d="M15,28 Q15,18 15,12" fill="none" stroke="black" stroke-width="0.7" stroke-linecap="round"/><path d="M20,28 Q19,20 16,16" fill="none" stroke="black" stroke-width="0.7" stroke-linecap="round"/>',
		'<path d="M11,28 Q12,21 15,17" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M17,28 Q16,19 14,13" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M22,28 Q20,21 17,17" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/>',
	],
	// Acacia — flat-topped canopy outline on trunk
	acacia: [
		'<path d="M4,16 Q4,6 15,4 Q26,6 26,16 Z" fill="none" stroke="black" stroke-width="0.8"/><line x1="15" y1="16" x2="15" y2="28" stroke="black" stroke-width="0.8"/>',
		'<path d="M5,17 Q5,7 15,5 Q25,7 25,17 Z" fill="none" stroke="black" stroke-width="0.8"/><line x1="15" y1="17" x2="15" y2="28" stroke="black" stroke-width="0.8"/>',
	],
	// Palm — curved trunk with radiating fronds
	palm: [
		'<path d="M16,28 Q15,20 13,14" fill="none" stroke="black" stroke-width="1.0" stroke-linecap="round"/><path d="M13,14 L5,9" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M13,14 L7,4" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M13,14 L15,3" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M13,14 L21,5" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M13,14 L23,10" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/>',
		'<path d="M14,28 Q14,21 12,15" fill="none" stroke="black" stroke-width="1.0" stroke-linecap="round"/><path d="M12,15 L4,11" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M12,15 L6,5" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M12,15 L14,2" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M12,15 L20,6" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M12,15 L22,12" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/>',
	],
	// Dunes — wavy mound shapes
	dune: [
		'<path d="M1,24 Q8,12 16,24 Q22,12 29,24" fill="none" stroke="black" stroke-width="0.8" stroke-linecap="round"/>',
		'<path d="M2,22 Q10,10 18,22 Q24,14 28,22" fill="none" stroke="black" stroke-width="0.8" stroke-linecap="round"/>',
	],
	// Swamp — vertical reeds with wavy water line
	swamp: [
		'<line x1="8" y1="24" x2="7" y2="8" stroke="black" stroke-width="0.6" stroke-linecap="round"/><line x1="15" y1="24" x2="15" y2="5" stroke="black" stroke-width="0.6" stroke-linecap="round"/><line x1="22" y1="24" x2="23" y2="10" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M2,22 Q8,19 15,22 Q22,25 28,22" fill="none" stroke="black" stroke-width="0.5"/>',
		'<line x1="10" y1="24" x2="9" y2="7" stroke="black" stroke-width="0.6" stroke-linecap="round"/><line x1="17" y1="24" x2="17" y2="4" stroke="black" stroke-width="0.6" stroke-linecap="round"/><line x1="24" y1="24" x2="25" y2="9" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M3,22 Q10,19 17,22 Q24,25 29,22" fill="none" stroke="black" stroke-width="0.5"/>',
		'<line x1="6" y1="24" x2="5" y2="9" stroke="black" stroke-width="0.6" stroke-linecap="round"/><line x1="13" y1="24" x2="13" y2="6" stroke="black" stroke-width="0.6" stroke-linecap="round"/><line x1="20" y1="24" x2="21" y2="8" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M1,22 Q7,19 13,22 Q19,25 27,22" fill="none" stroke="black" stroke-width="0.5"/>',
	],
	// Vulcan — flat-topped mountain with crater
	vulcan: [
		'<path d="M3,28 L10,6 L13,10 L17,10 L20,6 L27,28" fill="none" stroke="black" stroke-width="1.1" stroke-linejoin="round"/><line x1="18" y1="12" x2="23" y2="22" stroke="black" stroke-width="0.4"/><line x1="19" y1="16" x2="25" y2="26" stroke="black" stroke-width="0.35"/>',
	],
	// Cactus — saguaro-style
	cactus: [
		'<line x1="15" y1="28" x2="15" y2="4" stroke="black" stroke-width="1.2" stroke-linecap="round"/><path d="M15,14 Q8,14 8,8" fill="none" stroke="black" stroke-width="0.9" stroke-linecap="round"/><path d="M15,18 Q22,18 22,12" fill="none" stroke="black" stroke-width="0.9" stroke-linecap="round"/>',
		'<line x1="15" y1="28" x2="15" y2="5" stroke="black" stroke-width="1.2" stroke-linecap="round"/><path d="M15,16 Q7,16 7,10" fill="none" stroke="black" stroke-width="0.9" stroke-linecap="round"/><path d="M15,12 Q23,12 23,6" fill="none" stroke="black" stroke-width="0.9" stroke-linecap="round"/>',
		'<line x1="15" y1="28" x2="15" y2="6" stroke="black" stroke-width="1.1" stroke-linecap="round"/><path d="M15,15 Q9,15 9,9" fill="none" stroke="black" stroke-width="0.8" stroke-linecap="round"/><path d="M15,20 Q21,20 21,14" fill="none" stroke="black" stroke-width="0.8" stroke-linecap="round"/>',
	],
	// Dead tree — bare branching trunk
	deadTree: [
		'<line x1="15" y1="28" x2="15" y2="8" stroke="black" stroke-width="1.0" stroke-linecap="round"/><path d="M15,12 L8,4" fill="none" stroke="black" stroke-width="0.7" stroke-linecap="round"/><path d="M15,10 L22,3" fill="none" stroke="black" stroke-width="0.7" stroke-linecap="round"/><path d="M15,16 L6,12" fill="none" stroke="black" stroke-width="0.5" stroke-linecap="round"/><path d="M15,14 L24,10" fill="none" stroke="black" stroke-width="0.5" stroke-linecap="round"/>',
		'<line x1="15" y1="28" x2="14" y2="7" stroke="black" stroke-width="1.0" stroke-linecap="round"/><path d="M14,11 L7,3" fill="none" stroke="black" stroke-width="0.7" stroke-linecap="round"/><path d="M14,9 L21,2" fill="none" stroke="black" stroke-width="0.7" stroke-linecap="round"/><path d="M14,15 L5,11" fill="none" stroke="black" stroke-width="0.5" stroke-linecap="round"/><path d="M14,13 L23,8" fill="none" stroke="black" stroke-width="0.5" stroke-linecap="round"/>',
	],
};

/**
 * Returns Tolkien-style SVG content for a symbol ID.
 * Falls back to a simple dot if the type is unrecognized.
 */
function getTolkienContent(symbolId: string): string {
	const type = symbolId.replace(/^relief-/, '').replace(/-\d+$/, '');
	const variantIdx = parseInt(symbolId.match(/-(\d+)$/)?.[1] ?? '0', 10);
	const variants = TOLKIEN_CONTENT[type];
	if (!variants || variants.length === 0) {
		return '<circle cx="15" cy="15" r="3" fill="black"/>';
	}
	return variants[variantIdx % variants.length];
}

// ---------------------------------------------------------------------------
// Thinning & sizing — keep fewer icons and shrink them so terrain is
// *suggested* rather than carpeted, matching Tolkien's sparse placement style.
// ---------------------------------------------------------------------------

/** Fraction of icons to keep, by terrain type. */
const KEEP_RATE: Record<string, number> = {
	mount: 0.85,
	mountSnow: 0.85,
	hill: 0.55,
	conifer: 0.22,
	coniferSnow: 0.25,
	deciduous: 0.22,
	grass: 0.18,
	acacia: 0.28,
	palm: 0.35,
	dune: 0.45,
	swamp: 0.45,
	vulcan: 0.9,
	cactus: 0.35,
	deadTree: 0.4,
};

/** Size multiplier by terrain type. */
const SIZE_SCALE: Record<string, number> = {
	mount: 0.7,
	mountSnow: 0.7,
	hill: 0.6,
	conifer: 0.55,
	coniferSnow: 0.55,
	deciduous: 0.55,
	grass: 0.5,
	acacia: 0.55,
	palm: 0.55,
	dune: 0.6,
	swamp: 0.55,
	vulcan: 0.7,
	cactus: 0.5,
	deadTree: 0.55,
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

/** Pre-computed label clearance zones so terrain icons don't crowd text. */
const clearanceZones = computeClearanceZones(12);

/** Deterministic hash (0–1) from placement position so thinning is stable. */
function posHash(x: number, y: number): number {
	const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
	return n - Math.floor(n);
}

/** Derive terrain type from href (e.g. "relief-mount-1" -> "mount"). */
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
}).map((p) => {
	const scale = SIZE_SCALE[p.type] ?? 0.6;
	const newW = p.w * scale;
	const newH = p.h * scale;
	// Centre the shrunken icon on the original centre point
	const cx = p.x + p.w / 2;
	const cy = p.y + p.h / 2;
	return {
		x: cx - newW / 2,
		y: cy - newH / 2,
		w: newW,
		h: newH,
		href: p.href,
	};
});

const ReliefLayer = () => {
	const map = useMap();
	const [paneReady, setPaneReady] = useState(false);

	useEffect(() => {
		if (!map.getPane('reliefPane')) {
			map.createPane('reliefPane');
			map.getPane('reliefPane')!.style.zIndex = '250';
		}
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
					{RELIEF_SYMBOLS.map((sym) => (
						<symbol key={sym.id} id={sym.id} viewBox={TOLKIEN_VIEWBOX}>
							{/* eslint-disable-next-line react/no-danger -- trusted build-time SVG symbol IDs mapped to static Tolkien-style content */}
							<g dangerouslySetInnerHTML={{ __html: getTolkienContent(sym.id) }} />
						</symbol>
					))}
				</defs>
				{/* Individual icons */}
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
