'use client';

import { useState, useEffect } from 'react';
import { GeoJSON, useMap } from 'react-leaflet';
import { OCEAN_CONTOURS } from '@/lib/map-data';
import type { Feature } from 'geojson';

const CONTOUR_STYLES: Record<number, L.PathOptions> = {
	1: { color: '#6B5B4A', weight: 1.4, opacity: 0.28 },
	2: { color: '#6B5B4A', weight: 1.1, opacity: 0.20 },
	3: { color: '#6B5B4A', weight: 0.8, opacity: 0.14 },
	4: { color: '#6B5B4A', weight: 0.6, opacity: 0.08 },
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
				return {
					...(CONTOUR_STYLES[depth] ?? CONTOUR_STYLES[1]),
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
