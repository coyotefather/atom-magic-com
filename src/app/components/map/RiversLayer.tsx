'use client';

import { useState, useEffect, useRef } from 'react';
import { SVGOverlay, useMap } from 'react-leaflet';
import L from 'leaflet';
import rough from 'roughjs';
import { MAP_CONFIG } from '@/lib/map-data';
import { RIVER_PATHS } from '@/lib/river-data';

const RiversLayer = () => {
	const map = useMap();
	const [paneReady, setPaneReady] = useState(false);
	const gRef = useRef<SVGGElement>(null);
	const svgRef = useRef<SVGSVGElement>(null);

	useEffect(() => {
		if (!map.getPane('riverPane')) {
			map.createPane('riverPane');
			map.getPane('riverPane')!.style.zIndex = '420';
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
			fill: '#1a1a1a',
			fillStyle: 'solid' as const,
			stroke: 'none',
			roughness: 0.3,
		};

		for (const river of RIVER_PATHS) {
			g.appendChild(rc.path(river.d, opts));
		}
	}, [paneReady]);

	if (!paneReady || RIVER_PATHS.length === 0) return null;

	const bounds = L.latLngBounds(
		L.latLng(MAP_CONFIG.BOUNDS_SW[0], MAP_CONFIG.BOUNDS_SW[1]),
		L.latLng(MAP_CONFIG.BOUNDS_NE[0], MAP_CONFIG.BOUNDS_NE[1])
	);

	return (
		<SVGOverlay bounds={bounds} pane="riverPane" interactive={false}>
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

export default RiversLayer;
