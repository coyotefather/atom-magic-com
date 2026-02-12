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
			<svg viewBox={`0 0 ${MAP_CONFIG.SVG_WIDTH} ${MAP_CONFIG.SVG_HEIGHT}`} preserveAspectRatio="none">
				{RIVER_PATHS.map((river) => (
					<path
						key={river.id}
						d={river.d}
						fill="#5d97bb"
						stroke="none"
					/>
				))}
			</svg>
		</SVGOverlay>
	);
};

export default RiversLayer;
