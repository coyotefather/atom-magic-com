/**
 * RoughBorders.tsx
 *
 * Draws the visible borders between regions using RoughJS to produce a
 * hand-drawn ink line aesthetic. Each region boundary polygon ring is
 * converted to an SVG path and passed to RoughJS with low roughness (0.5)
 * and slight bowing (0.6), giving the borders a slightly wobbly quality that
 * evokes a cartographer's quill rather than a computer-generated line.
 *
 * This layer only draws strokes (fill: none) — the solid land fill is
 * handled by CoastlineShadow and the colored biome fills by BiomeFillLayer.
 *
 * RoughJS generates SVG elements imperatively (not declaratively), so the
 * component uses refs to a <g> and <svg> element and replaces child nodes on
 * mount. The rough elements are generated once (when paneReady becomes true)
 * and are static thereafter.
 *
 * Rendering technique: Leaflet SVGOverlay inside a custom pane
 * ("roughBorderPane", z-index 410, above RegionOverlay at ~400 but below
 * RiversLayer at 420). Coordinates use the (lng * 32, -lat * 32) SVG pixel
 * transform. Handles both Polygon and MultiPolygon GeoJSON geometry types.
 *
 * Used by:
 *   - SolumMap.tsx (rendered inside the Leaflet MapContainer)
 */
'use client';

import { useState, useEffect, useRef } from 'react';
import { SVGOverlay, useMap } from 'react-leaflet';
import L from 'leaflet';
import rough from 'roughjs';
import { MAP_CONFIG, REGION_BOUNDARIES } from '@/lib/map-data';
function ringToSvgPath(ring: number[][]): string {
	return ring.map((coord, i) => {
		const x = coord[0] * 32;
		const y = -coord[1] * 32;
		return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
	}).join(' ') + ' Z';
}

/**
 * Renders region boundary polygons through Rough.js for a hand-drawn ink effect.
 * Uses its own SVGOverlay pane at z-index 410 (above RegionOverlay, below rivers).
 */
const RoughBorders = () => {
	const map = useMap();
	const [paneReady, setPaneReady] = useState(false);
	const gRef = useRef<SVGGElement>(null);
	const svgRef = useRef<SVGSVGElement>(null);

	useEffect(() => {
		if (!map.getPane('roughBorderPane')) {
			map.createPane('roughBorderPane');
			map.getPane('roughBorderPane')!.style.zIndex = '410';
		}
		setPaneReady(true);
	}, [map]);

	useEffect(() => {
		if (!paneReady || !gRef.current || !svgRef.current) return;

		const g = gRef.current;
		// Clear previous rough elements
		while (g.firstChild) {
			g.removeChild(g.firstChild);
		}

		const rc = rough.svg(svgRef.current);
		const opts = {
			roughness: 0.5,
			strokeWidth: 0.9,
			bowing: 0.6,
			stroke: '#1a1a1a',
			fill: 'none',
			disableMultiStroke: true,
		};

		for (const feature of REGION_BOUNDARIES.features) {
			const geom = feature.geometry;
			if (geom.type === 'Polygon') {
				const d = ringToSvgPath(geom.coordinates[0] as number[][]);
				g.appendChild(rc.path(d, opts));
			} else if (geom.type === 'MultiPolygon') {
				for (const polygon of geom.coordinates as number[][][][]) {
					const d = ringToSvgPath(polygon[0]);
					g.appendChild(rc.path(d, opts));
				}
			}
		}
	}, [paneReady]);

	if (!paneReady) return null;

	const bounds = L.latLngBounds(
		L.latLng(MAP_CONFIG.BOUNDS_SW[0], MAP_CONFIG.BOUNDS_SW[1]),
		L.latLng(MAP_CONFIG.BOUNDS_NE[0], MAP_CONFIG.BOUNDS_NE[1])
	);

	return (
		<SVGOverlay bounds={bounds} pane="roughBorderPane" interactive={false}>
			<svg
				ref={svgRef}
				viewBox={`0 0 ${MAP_CONFIG.SVG_WIDTH} ${MAP_CONFIG.SVG_HEIGHT}`}
				preserveAspectRatio="none"
			>
				<g ref={gRef} />
			</svg>
		</SVGOverlay>
	);
};

export default RoughBorders;
