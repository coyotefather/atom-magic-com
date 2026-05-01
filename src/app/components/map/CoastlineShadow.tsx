/**
 * CoastlineShadow.tsx
 *
 * Paints all region polygons as solid parchment-colored fills (#EDE8D5) to
 * create the "land" surface of the map. A CSS drop-shadow filter applied to
 * the Leaflet pane itself produces a soft coastal glow around the entire
 * landmass where it meets the (empty, ocean-colored) background.
 *
 * This layer intentionally draws no stroke lines — border drawing is handled
 * separately by RoughBorders.tsx. The pane drop-shadow is what creates the
 * visible coastline edge effect.
 *
 * RoughJS is used to render the polygons (via rc.path), but roughness is set
 * to 0 so the shapes are geometrically exact; only the fill and shadow matter.
 *
 * Rendering technique: Leaflet SVGOverlay inside a custom pane
 * ("coastlineShadowPane", z-index 140) with a CSS drop-shadow filter on the
 * pane element. RoughJS writes SVG elements imperatively into a <g> ref.
 * Coordinates use the standard (lng * 32, -lat * 32) SVG pixel transform.
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
 * Renders all region polygons as solid paper fills with a bold ink coastline
 * and subtle drop-shadow, drawn through Rough.js for a hand-drawn appearance.
 */
const CoastlineShadow = () => {
	const map = useMap();
	const [paneReady, setPaneReady] = useState(false);
	const gRef = useRef<SVGGElement>(null);
	const svgRef = useRef<SVGSVGElement>(null);

	useEffect(() => {
		if (!map.getPane('coastlineShadowPane')) {
			map.createPane('coastlineShadowPane');
			const pane = map.getPane('coastlineShadowPane')!;
			pane.style.zIndex = '140';
			pane.style.filter =
				'drop-shadow(0 0 4px rgba(0, 0, 0, 0.25)) drop-shadow(0 0 1px rgba(0, 0, 0, 0.15))';
		}
		setPaneReady(true);
	}, [map]);

	useEffect(() => {
		if (!paneReady || !gRef.current || !svgRef.current) return;

		const g = gRef.current;
		while (g.firstChild) {
			g.removeChild(g.firstChild);
		}

		const rc = rough.svg(svgRef.current);
		// Fill only — no stroke here. RoughBorders owns the border drawing.
		// The pane drop-shadow creates the coastline glow on the land edge.
		const opts = {
			roughness: 0,
			stroke: 'none',
			fill: '#EDE8D5',
			fillStyle: 'solid' as const,
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
		<SVGOverlay bounds={bounds} pane="coastlineShadowPane" interactive={false}>
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

export default CoastlineShadow;
