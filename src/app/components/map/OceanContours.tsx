'use client';

import { useState, useEffect } from 'react';
import { GeoJSON, useMap } from 'react-leaflet';
import { OCEAN_CONTOURS } from '@/lib/map-data';
import type { Feature } from 'geojson';

const CONTOUR_STYLES: Record<number, L.PathOptions> = {
	1: { color: '#1a1a1a', weight: 1.0, opacity: 0.25, dashArray: '4 3' },
	2: { color: '#1a1a1a', weight: 0.8, opacity: 0.18, dashArray: '3 4' },
	3: { color: '#1a1a1a', weight: 0.6, opacity: 0.12, dashArray: '2 5' },
	4: { color: '#1a1a1a', weight: 0.5, opacity: 0.07, dashArray: '2 6' },
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
