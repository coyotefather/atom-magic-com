'use client';

import { useState, useEffect } from 'react';
import { GeoJSON, useMap } from 'react-leaflet';
import { OCEAN_CONTOURS } from '@/lib/map-data';
import type { Feature } from 'geojson';

const CONTOUR_STYLES: Record<number, L.PathOptions> = {
	1:  { color: '#6B5B3E', weight: 1.2, opacity: 0.55 },
	2:  { color: '#6B5B3E', weight: 1.1, opacity: 0.48 },
	3:  { color: '#6B5B3E', weight: 1.0, opacity: 0.42 },
	4:  { color: '#6B5B3E', weight: 0.9, opacity: 0.36 },
	5:  { color: '#6B5B3E', weight: 0.8, opacity: 0.30 },
	6:  { color: '#6B5B3E', weight: 0.7, opacity: 0.24 },
	7:  { color: '#6B5B3E', weight: 0.6, opacity: 0.19 },
	8:  { color: '#6B5B3E', weight: 0.5, opacity: 0.15 },
	9:  { color: '#6B5B3E', weight: 0.45, opacity: 0.11 },
	10: { color: '#6B5B3E', weight: 0.4, opacity: 0.08 },
	11: { color: '#6B5B3E', weight: 0.35, opacity: 0.05 },
	12: { color: '#6B5B3E', weight: 0.3, opacity: 0.03 },
};

const OceanContours = () => {
	const map = useMap();
	const [paneReady, setPaneReady] = useState(false);

	// Create contour pane below tile pane (z-index 200) so land tiles mask contours on land
	useEffect(() => {
		if (!map.getPane('contourPane')) {
			map.createPane('contourPane');
			map.getPane('contourPane')!.style.zIndex = '150';
		}
		setPaneReady(true);
	}, [map]);

	if (!paneReady || OCEAN_CONTOURS.features.length === 0) return null;

	return (
		<GeoJSON
			data={OCEAN_CONTOURS}
			style={(feature: Feature | undefined) => {
				const depth = (feature?.properties?.depth as number) ?? 1;
				const baseStyle = CONTOUR_STYLES[depth] ?? CONTOUR_STYLES[1];
				return {
					...baseStyle,
					fill: false,
					interactive: false,
				};
			}}
			interactive={false}
			pane="contourPane"
		/>
	);
};

export default OceanContours;
