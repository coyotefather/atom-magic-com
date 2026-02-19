'use client';

import { useState, useEffect } from 'react';
import { SVGOverlay, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MAP_CONFIG } from '@/lib/map-data';
import { RELIEF_SYMBOLS, RELIEF_PLACEMENTS } from '@/lib/relief-data';
import { computeClearanceZones, type LabelBBox } from '@/lib/label-config';

// ---------------------------------------------------------------------------
// Thinning & sizing — keep fewer icons so terrain is suggested rather than
// carpeted, matching a sparse Tolkien-style placement.
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

/** Pre-computed label clearance zones so icons don't crowd text. */
const clearanceZones = computeClearanceZones(12);

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
}).map((p) => {
	const scale = SIZE_SCALE[p.type] ?? 0.6;
	const newW = p.w * scale;
	const newH = p.h * scale;
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

/** Only include symbol defs that are actually referenced by visible placements. */
const usedSymbolIds = new Set(visiblePlacements.map((p) => p.href));
const usedSymbols = RELIEF_SYMBOLS.filter((sym) => usedSymbolIds.has(sym.id));

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
					{usedSymbols.map((sym) => (
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
