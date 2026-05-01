/**
 * RiversLayer.tsx
 *
 * Renders river paths across the map as semi-transparent dark filled shapes.
 * River data comes from RIVER_PATHS in lib/river-data.ts, which contains
 * pre-built SVG path strings (Bézier curves) exported from Azgaar Fantasy Map
 * Generator. The paths already encode varying river widths — wider near river
 * mouths, narrower at headwaters.
 *
 * Plain SVG paths are used instead of RoughJS here because the Azgaar Bézier
 * curves are already organic-looking; adding RoughJS roughness on top would
 * only distort the carefully shaped curves.
 *
 * Paths are filled (not stroked) at 55% opacity in near-black (#1a1a1a), which
 * produces a dark ink-blue appearance on the parchment background.
 *
 * Rendering technique: Leaflet SVGOverlay inside a custom pane ("riverPane",
 * z-index 420). River path strings are used directly as SVG `d` attributes.
 * The component renders nothing if RIVER_PATHS is empty.
 *
 * Used by:
 *   - SolumMap.tsx (rendered inside the Leaflet MapContainer)
 */
'use client';

import { useState, useEffect } from 'react';
import { SVGOverlay, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MAP_CONFIG } from '@/lib/map-data';
import { RIVER_PATHS } from '@/lib/river-data';
const RiversLayer = () => {
	const map = useMap();
	const [paneReady, setPaneReady] = useState(false);

	useEffect(() => {
		if (!map.getPane('riverPane')) {
			map.createPane('riverPane');
			map.getPane('riverPane')!.style.zIndex = '420';
		}
		setPaneReady(true);
	}, [map]);

	if (!paneReady || RIVER_PATHS.length === 0) return null;

	const bounds = L.latLngBounds(
		L.latLng(MAP_CONFIG.BOUNDS_SW[0], MAP_CONFIG.BOUNDS_SW[1]),
		L.latLng(MAP_CONFIG.BOUNDS_NE[0], MAP_CONFIG.BOUNDS_NE[1])
	);

	return (
		<SVGOverlay bounds={bounds} pane="riverPane" interactive={false}>
			<svg
				viewBox={`0 0 ${MAP_CONFIG.SVG_WIDTH} ${MAP_CONFIG.SVG_HEIGHT}`}
				preserveAspectRatio="none"
			>
				{RIVER_PATHS.map((river) => (
					<path key={river.id} d={river.d} fill="#1a1a1a" fillOpacity={0.55} stroke="none" />
				))}
			</svg>
		</SVGOverlay>
	);
};

export default RiversLayer;
