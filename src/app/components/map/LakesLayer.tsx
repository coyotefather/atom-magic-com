/**
 * LakesLayer.tsx
 *
 * Renders lake polygons on the map with a hand-crafted watercolor aesthetic.
 * Each lake gets two RoughJS passes:
 *   1. A smooth, solid grey-blue fill (roughness 0) for the water surface.
 *   2. A slightly wobbly stroke outline (roughness 0.3) in a darker teal-grey
 *      to suggest a hand-drawn shoreline.
 *
 * Lake polygon data comes from LAKE_POLYGONS in lib/lake-data.ts, which
 * provides pre-built SVG path strings already in the SVG coordinate space
 * (no coordinate conversion needed here).
 *
 * Rendering technique: Leaflet SVGOverlay inside a custom pane ("lakePane",
 * z-index 200). RoughJS writes SVG elements imperatively into a <g> ref.
 * The component renders nothing if LAKE_POLYGONS is empty, so it has no
 * cost when lake data has not been generated.
 *
 * Used by:
 *   - SolumMap.tsx (rendered inside the Leaflet MapContainer)
 */
'use client';

import { useState, useEffect, useRef } from 'react';
import { SVGOverlay, useMap } from 'react-leaflet';
import L from 'leaflet';
import rough from 'roughjs';
import { MAP_CONFIG } from '@/lib/map-data';
import { LAKE_POLYGONS } from '@/lib/lake-data';

const LakesLayer = () => {
	const map = useMap();
	const [paneReady, setPaneReady] = useState(false);
	const gRef = useRef<SVGGElement>(null);
	const svgRef = useRef<SVGSVGElement>(null);

	useEffect(() => {
		if (!map.getPane('lakePane')) {
			map.createPane('lakePane');
			map.getPane('lakePane')!.style.zIndex = '200';
		}
		setPaneReady(true);
	}, [map]);

	useEffect(() => {
		if (!paneReady || !gRef.current || !svgRef.current || LAKE_POLYGONS.length === 0) return;

		const g = gRef.current;
		while (g.firstChild) g.removeChild(g.firstChild);

		const rc = rough.svg(svgRef.current);

		for (const lake of LAKE_POLYGONS) {
			// Solid fill — no roughness on the fill itself
			g.appendChild(rc.path(lake.d, {
				roughness: 0,
				stroke: 'none',
				fill: '#C8CFCA',
				fillStyle: 'solid',
			}));
			// Hand-drawn outline
			g.appendChild(rc.path(lake.d, {
				roughness: 0.3,
				stroke: '#8AA898',
				strokeWidth: 0.8,
				fill: 'none',
				bowing: 0.3,
				disableMultiStroke: true,
			}));
		}
	}, [paneReady]);

	if (!paneReady || LAKE_POLYGONS.length === 0) return null;

	const bounds = L.latLngBounds(
		L.latLng(MAP_CONFIG.BOUNDS_SW[0], MAP_CONFIG.BOUNDS_SW[1]),
		L.latLng(MAP_CONFIG.BOUNDS_NE[0], MAP_CONFIG.BOUNDS_NE[1])
	);

	return (
		<SVGOverlay bounds={bounds} pane="lakePane" interactive={false}>
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

export default LakesLayer;
