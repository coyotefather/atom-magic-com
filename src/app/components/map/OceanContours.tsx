/**
 * OceanContours.tsx
 *
 * Draws concentric depth contour lines in the ocean areas to suggest
 * bathymetric depth, similar to isobath lines on nautical charts. Contours
 * are colored in a warm brown (#6B5B3E) and fade out progressively at greater
 * depths: depth level 1 (nearest the coast) is the heaviest and most opaque;
 * depth level 12 is a hairline at near-invisible opacity.
 *
 * Each contour ring is rendered through RoughJS with low roughness (0.25) and
 * slight bowing (0.4) so lines look slightly hand-drawn rather than perfectly
 * mechanical. The CONTOUR_STYLES lookup table maps depth integers to stroke
 * weight and opacity values.
 *
 * Contour data comes from OCEAN_CONTOURS in map-data.ts, which is a GeoJSON
 * FeatureCollection where each feature has a `depth` integer property.
 *
 * Rendering technique: Leaflet SVGOverlay inside a custom pane ("contourPane",
 * z-index 150). RoughJS writes SVG elements imperatively into a <g> ref.
 * Coordinates use the (lng * 32, -lat * 32) SVG pixel transform.
 *
 * Used by:
 *   - SolumMap.tsx (rendered inside the Leaflet MapContainer)
 */
'use client';

import { useState, useEffect, useRef } from 'react';
import { SVGOverlay, useMap } from 'react-leaflet';
import L from 'leaflet';
import rough from 'roughjs';
import { MAP_CONFIG, OCEAN_CONTOURS } from '@/lib/map-data';

function ringToSvgPath(ring: number[][]): string {
	return ring.map((coord, i) => {
		const x = coord[0] * 32;
		const y = -coord[1] * 32;
		return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
	}).join(' ') + ' Z';
}

const CONTOUR_STYLES: Record<number, { weight: number; opacity: number }> = {
	1:  { weight: 2.0, opacity: 0.75 },
	2:  { weight: 1.6, opacity: 0.62 },
	3:  { weight: 1.3, opacity: 0.52 },
	4:  { weight: 1.1, opacity: 0.42 },
	5:  { weight: 0.9, opacity: 0.34 },
	6:  { weight: 0.8, opacity: 0.27 },
	7:  { weight: 0.7, opacity: 0.21 },
	8:  { weight: 0.6, opacity: 0.16 },
	9:  { weight: 0.55, opacity: 0.12 },
	10: { weight: 0.5,  opacity: 0.09 },
	11: { weight: 0.45, opacity: 0.06 },
	12: { weight: 0.4,  opacity: 0.04 },
};

const OceanContours = () => {
	const map = useMap();
	const [paneReady, setPaneReady] = useState(false);
	const gRef = useRef<SVGGElement>(null);
	const svgRef = useRef<SVGSVGElement>(null);

	useEffect(() => {
		if (!map.getPane('contourPane')) {
			map.createPane('contourPane');
			map.getPane('contourPane')!.style.zIndex = '150';
		}
		setPaneReady(true);
	}, [map]);

	useEffect(() => {
		if (!paneReady || !gRef.current || !svgRef.current) return;

		const g = gRef.current;
		while (g.firstChild) g.removeChild(g.firstChild);

		const rc = rough.svg(svgRef.current);

		for (const feature of OCEAN_CONTOURS.features) {
			const depth = (feature.properties?.depth as number) ?? 1;
			const style = CONTOUR_STYLES[depth] ?? CONTOUR_STYLES[1];
			const opts = {
				roughness: 0.25,
				bowing: 0.4,
				strokeWidth: style.weight,
				stroke: '#6B5B3E',
				fill: 'none',
				disableMultiStroke: true,
			};

			const drawRing = (ring: number[][]) => {
				const el = rc.path(ringToSvgPath(ring), opts);
				el.setAttribute('opacity', String(style.opacity));
				g.appendChild(el);
			};

			const geom = feature.geometry;
			if (geom.type === 'Polygon') {
				drawRing(geom.coordinates[0] as number[][]);
			} else if (geom.type === 'MultiPolygon') {
				for (const polygon of geom.coordinates as number[][][][]) {
					drawRing(polygon[0]);
				}
			}
		}
	}, [paneReady]);

	if (!paneReady || OCEAN_CONTOURS.features.length === 0) return null;

	const bounds = L.latLngBounds(
		L.latLng(MAP_CONFIG.BOUNDS_SW[0], MAP_CONFIG.BOUNDS_SW[1]),
		L.latLng(MAP_CONFIG.BOUNDS_NE[0], MAP_CONFIG.BOUNDS_NE[1])
	);

	return (
		<SVGOverlay bounds={bounds} pane="contourPane" interactive={false}>
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

export default OceanContours;
