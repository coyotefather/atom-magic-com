'use client';

import { useState, useEffect } from 'react';
import { SVGOverlay, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MAP_CONFIG } from '@/lib/map-data';
import { LAKE_POLYGONS } from '@/lib/lake-data';

const LakesLayer = () => {
	const map = useMap();
	const [paneReady, setPaneReady] = useState(false);

	useEffect(() => {
		if (!map.getPane('lakePane')) {
			map.createPane('lakePane');
			map.getPane('lakePane')!.style.zIndex = '200';
		}
		setPaneReady(true);
	}, [map]);

	if (!paneReady || LAKE_POLYGONS.length === 0) return null;

	const bounds = L.latLngBounds(
		L.latLng(MAP_CONFIG.BOUNDS_SW[0], MAP_CONFIG.BOUNDS_SW[1]),
		L.latLng(MAP_CONFIG.BOUNDS_NE[0], MAP_CONFIG.BOUNDS_NE[1])
	);

	return (
		<SVGOverlay bounds={bounds} pane="lakePane" interactive={false}>
			<svg viewBox={`0 0 ${MAP_CONFIG.SVG_WIDTH} ${MAP_CONFIG.SVG_HEIGHT}`} preserveAspectRatio="none">
				{LAKE_POLYGONS.map((lake) => (
					<path
						key={lake.id}
						d={lake.d}
						fill={lake.fill}
						stroke={lake.stroke}
						strokeWidth={0.7}
						opacity={lake.opacity}
					/>
				))}
			</svg>
		</SVGOverlay>
	);
};

export default LakesLayer;
