'use client';

import { useState, useEffect } from 'react';
import { SVGOverlay, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MAP_CONFIG } from '@/lib/map-data';
import { RELIEF_SYMBOLS, RELIEF_PLACEMENTS } from '@/lib/relief-data';

// ---------------------------------------------------------------------------
// Tolkien-style SVG symbol content by type.
// Each type has multiple variants for organic feel. Symbols use viewBox 0 0 30 30.
// All content is black ink — peaked mountains with hatching, solid tree silhouettes,
// grass tufts, etc., matching Tolkien's hand-drawn cartographic style.
// ---------------------------------------------------------------------------

const TOLKIEN_VIEWBOX = '0 0 30 30';

const TOLKIEN_CONTENT: Record<string, string[]> = {
	// Mountains — peaked triangles with hatching lines on one side
	mount: [
		'<path d="M3,28 L15,3 L27,28" fill="none" stroke="black" stroke-width="1.8" stroke-linejoin="round"/><line x1="16" y1="7" x2="21" y2="19" stroke="black" stroke-width="0.7"/><line x1="17" y1="11" x2="23" y2="23" stroke="black" stroke-width="0.6"/><line x1="18" y1="15" x2="25" y2="26" stroke="black" stroke-width="0.5"/>',
		'<path d="M5,28 L13,3 L25,28" fill="none" stroke="black" stroke-width="1.8" stroke-linejoin="round"/><line x1="14" y1="7" x2="20" y2="21" stroke="black" stroke-width="0.7"/><line x1="15" y1="11" x2="22" y2="24" stroke="black" stroke-width="0.5"/><line x1="16" y1="15" x2="24" y2="27" stroke="black" stroke-width="0.4"/>',
		'<path d="M2,28 L14,4 L28,28" fill="none" stroke="black" stroke-width="1.6" stroke-linejoin="round"/><line x1="15" y1="8" x2="22" y2="22" stroke="black" stroke-width="0.7"/><line x1="16" y1="12" x2="24" y2="25" stroke="black" stroke-width="0.5"/><line x1="17" y1="16" x2="26" y2="27" stroke="black" stroke-width="0.4"/>',
		'<path d="M4,28 L16,2 L26,28" fill="none" stroke="black" stroke-width="1.7" stroke-linejoin="round"/><line x1="17" y1="6" x2="21" y2="17" stroke="black" stroke-width="0.7"/><line x1="18" y1="10" x2="23" y2="22" stroke="black" stroke-width="0.6"/><line x1="18" y1="14" x2="25" y2="26" stroke="black" stroke-width="0.4"/>',
	],
	// Snow-capped mountains — peak outline left open at top for snow cap
	mountSnow: [
		'<path d="M3,28 L15,3 L27,28" fill="none" stroke="black" stroke-width="1.8" stroke-linejoin="round"/><line x1="10" y1="16" x2="20" y2="16" stroke="black" stroke-width="0.6"/><line x1="17" y1="14" x2="23" y2="24" stroke="black" stroke-width="0.6"/><line x1="18" y1="18" x2="25" y2="27" stroke="black" stroke-width="0.5"/>',
		'<path d="M4,28 L14,4 L26,28" fill="none" stroke="black" stroke-width="1.7" stroke-linejoin="round"/><line x1="9" y1="17" x2="19" y2="17" stroke="black" stroke-width="0.6"/><line x1="16" y1="15" x2="22" y2="25" stroke="black" stroke-width="0.6"/><line x1="17" y1="19" x2="24" y2="27" stroke="black" stroke-width="0.4"/>',
		'<path d="M5,28 L15,2 L25,28" fill="none" stroke="black" stroke-width="1.8" stroke-linejoin="round"/><line x1="10" y1="15" x2="20" y2="15" stroke="black" stroke-width="0.6"/><line x1="16" y1="13" x2="21" y2="22" stroke="black" stroke-width="0.6"/><line x1="17" y1="17" x2="23" y2="26" stroke="black" stroke-width="0.5"/>',
	],
	// Hills — rounded bumps with light hatching
	hill: [
		'<path d="M2,26 Q15,4 28,26" fill="none" stroke="black" stroke-width="1.4" stroke-linecap="round"/><line x1="16" y1="12" x2="22" y2="22" stroke="black" stroke-width="0.6"/><line x1="18" y1="16" x2="24" y2="24" stroke="black" stroke-width="0.5"/>',
		'<path d="M3,26 Q13,6 27,26" fill="none" stroke="black" stroke-width="1.3" stroke-linecap="round"/><line x1="15" y1="13" x2="21" y2="23" stroke="black" stroke-width="0.6"/><line x1="17" y1="17" x2="23" y2="25" stroke="black" stroke-width="0.4"/>',
		'<path d="M4,27 Q16,5 26,27" fill="none" stroke="black" stroke-width="1.4" stroke-linecap="round"/><line x1="17" y1="11" x2="22" y2="22" stroke="black" stroke-width="0.5"/><line x1="18" y1="15" x2="24" y2="25" stroke="black" stroke-width="0.4"/>',
	],
	// Conifers — solid pointed tree silhouettes
	conifer: [
		'<path d="M15,1 L9,14 L12,12 L7,24 L23,24 L18,12 L21,14 Z" fill="black"/><rect x="13" y="24" width="4" height="5" fill="black"/>',
		'<path d="M15,2 L10,13 L13,11 L8,22 L22,22 L17,11 L20,13 Z" fill="black"/><rect x="13" y="22" width="4" height="6" fill="black"/>',
	],
	// Snow conifers — outlined rather than filled for lighter look
	coniferSnow: [
		'<path d="M15,2 L9,14 L12,12 L7,24 L23,24 L18,12 L21,14 Z" fill="none" stroke="black" stroke-width="1.2"/><rect x="13" y="24" width="4" height="5" fill="black"/>',
	],
	// Deciduous — rounded canopy silhouettes
	deciduous: [
		'<path d="M15,4 C8,4 3,9 3,15 C3,21 8,24 15,24 C22,24 27,21 27,15 C27,9 22,4 15,4 Z" fill="black"/><rect x="13" y="23" width="4" height="6" fill="black"/>',
		'<path d="M15,5 C9,5 5,10 5,15 C5,20 9,23 15,23 C21,23 25,20 25,15 C25,10 21,5 15,5 Z" fill="black"/><rect x="13" y="22" width="4" height="7" fill="black"/>',
		'<path d="M14,3 C7,4 2,10 3,16 C4,22 9,25 15,25 C21,25 26,21 27,15 C28,9 23,3 14,3 Z" fill="black"/><rect x="13" y="24" width="4" height="5" fill="black"/>',
	],
	// Grass — small curved strokes rising from base
	grass: [
		'<path d="M8,28 Q9,19 13,14" fill="none" stroke="black" stroke-width="1.1" stroke-linecap="round"/><path d="M15,28 Q15,17 15,10" fill="none" stroke="black" stroke-width="1.1" stroke-linecap="round"/><path d="M22,28 Q21,19 17,14" fill="none" stroke="black" stroke-width="1.1" stroke-linecap="round"/>',
		'<path d="M10,28 Q11,20 14,16" fill="none" stroke="black" stroke-width="1" stroke-linecap="round"/><path d="M17,28 Q16,18 14,12" fill="none" stroke="black" stroke-width="1" stroke-linecap="round"/><path d="M23,28 Q21,20 18,16" fill="none" stroke="black" stroke-width="1" stroke-linecap="round"/>',
	],
	// Acacia — flat-topped canopy on trunk
	acacia: [
		'<path d="M4,16 Q4,6 15,4 Q26,6 26,16 Z" fill="black"/><rect x="14" y="16" width="2" height="12" fill="black"/>',
		'<path d="M5,17 Q5,7 15,5 Q25,7 25,17 Z" fill="black"/><rect x="14" y="17" width="2" height="11" fill="black"/>',
	],
	// Palm — curved trunk with radiating fronds
	palm: [
		'<path d="M16,28 Q15,20 13,14" fill="none" stroke="black" stroke-width="1.6" stroke-linecap="round"/><path d="M13,14 L5,9" fill="none" stroke="black" stroke-width="0.9" stroke-linecap="round"/><path d="M13,14 L7,4" fill="none" stroke="black" stroke-width="0.9" stroke-linecap="round"/><path d="M13,14 L15,3" fill="none" stroke="black" stroke-width="0.9" stroke-linecap="round"/><path d="M13,14 L21,5" fill="none" stroke="black" stroke-width="0.9" stroke-linecap="round"/><path d="M13,14 L23,10" fill="none" stroke="black" stroke-width="0.9" stroke-linecap="round"/>',
		'<path d="M14,28 Q14,21 12,15" fill="none" stroke="black" stroke-width="1.5" stroke-linecap="round"/><path d="M12,15 L4,11" fill="none" stroke="black" stroke-width="0.8" stroke-linecap="round"/><path d="M12,15 L6,5" fill="none" stroke="black" stroke-width="0.8" stroke-linecap="round"/><path d="M12,15 L14,2" fill="none" stroke="black" stroke-width="0.8" stroke-linecap="round"/><path d="M12,15 L20,6" fill="none" stroke="black" stroke-width="0.8" stroke-linecap="round"/><path d="M12,15 L22,12" fill="none" stroke="black" stroke-width="0.8" stroke-linecap="round"/>',
	],
	// Dunes — wavy mound shapes
	dune: [
		'<path d="M1,24 Q8,12 16,24 Q22,12 29,24" fill="none" stroke="black" stroke-width="1.2" stroke-linecap="round"/>',
		'<path d="M2,22 Q10,10 18,22 Q24,14 28,22" fill="none" stroke="black" stroke-width="1.1" stroke-linecap="round"/>',
	],
	// Swamp — vertical reeds with wavy water line
	swamp: [
		'<line x1="8" y1="24" x2="7" y2="8" stroke="black" stroke-width="0.9" stroke-linecap="round"/><line x1="15" y1="24" x2="15" y2="5" stroke="black" stroke-width="0.9" stroke-linecap="round"/><line x1="22" y1="24" x2="23" y2="10" stroke="black" stroke-width="0.9" stroke-linecap="round"/><path d="M2,22 Q8,19 15,22 Q22,25 28,22" fill="none" stroke="black" stroke-width="0.7"/>',
		'<line x1="10" y1="24" x2="9" y2="7" stroke="black" stroke-width="0.9" stroke-linecap="round"/><line x1="17" y1="24" x2="17" y2="4" stroke="black" stroke-width="0.9" stroke-linecap="round"/><line x1="24" y1="24" x2="25" y2="9" stroke="black" stroke-width="0.9" stroke-linecap="round"/><path d="M3,22 Q10,19 17,22 Q24,25 29,22" fill="none" stroke="black" stroke-width="0.7"/>',
		'<line x1="6" y1="24" x2="5" y2="9" stroke="black" stroke-width="0.8" stroke-linecap="round"/><line x1="13" y1="24" x2="13" y2="6" stroke="black" stroke-width="0.9" stroke-linecap="round"/><line x1="20" y1="24" x2="21" y2="8" stroke="black" stroke-width="0.8" stroke-linecap="round"/><path d="M1,22 Q7,19 13,22 Q19,25 27,22" fill="none" stroke="black" stroke-width="0.7"/>',
	],
	// Vulcan — flat-topped mountain with crater
	vulcan: [
		'<path d="M3,28 L10,6 L13,10 L17,10 L20,6 L27,28" fill="none" stroke="black" stroke-width="1.6" stroke-linejoin="round"/><line x1="18" y1="12" x2="23" y2="22" stroke="black" stroke-width="0.6"/><line x1="19" y1="16" x2="25" y2="26" stroke="black" stroke-width="0.5"/>',
	],
	// Cactus — saguaro-style
	cactus: [
		'<line x1="15" y1="28" x2="15" y2="4" stroke="black" stroke-width="2" stroke-linecap="round"/><path d="M15,14 Q8,14 8,8" fill="none" stroke="black" stroke-width="1.5" stroke-linecap="round"/><path d="M15,18 Q22,18 22,12" fill="none" stroke="black" stroke-width="1.5" stroke-linecap="round"/>',
		'<line x1="15" y1="28" x2="15" y2="5" stroke="black" stroke-width="2" stroke-linecap="round"/><path d="M15,16 Q7,16 7,10" fill="none" stroke="black" stroke-width="1.5" stroke-linecap="round"/><path d="M15,12 Q23,12 23,6" fill="none" stroke="black" stroke-width="1.5" stroke-linecap="round"/>',
		'<line x1="15" y1="28" x2="15" y2="6" stroke="black" stroke-width="1.8" stroke-linecap="round"/><path d="M15,15 Q9,15 9,9" fill="none" stroke="black" stroke-width="1.4" stroke-linecap="round"/><path d="M15,20 Q21,20 21,14" fill="none" stroke="black" stroke-width="1.4" stroke-linecap="round"/>',
	],
	// Dead tree — bare branching trunk
	deadTree: [
		'<line x1="15" y1="28" x2="15" y2="8" stroke="black" stroke-width="1.5" stroke-linecap="round"/><path d="M15,12 L8,4" fill="none" stroke="black" stroke-width="1" stroke-linecap="round"/><path d="M15,10 L22,3" fill="none" stroke="black" stroke-width="1" stroke-linecap="round"/><path d="M15,16 L6,12" fill="none" stroke="black" stroke-width="0.8" stroke-linecap="round"/><path d="M15,14 L24,10" fill="none" stroke="black" stroke-width="0.8" stroke-linecap="round"/>',
		'<line x1="15" y1="28" x2="14" y2="7" stroke="black" stroke-width="1.5" stroke-linecap="round"/><path d="M14,11 L7,3" fill="none" stroke="black" stroke-width="1" stroke-linecap="round"/><path d="M14,9 L21,2" fill="none" stroke="black" stroke-width="1" stroke-linecap="round"/><path d="M14,15 L5,11" fill="none" stroke="black" stroke-width="0.8" stroke-linecap="round"/><path d="M14,13 L23,8" fill="none" stroke="black" stroke-width="0.8" stroke-linecap="round"/>',
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

	if (!paneReady || RELIEF_PLACEMENTS.length === 0) return null;

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
				{RELIEF_PLACEMENTS.map((p, i) => (
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
