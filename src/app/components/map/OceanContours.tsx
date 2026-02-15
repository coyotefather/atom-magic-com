'use client';

import { useState, useEffect } from 'react';
import { GeoJSON, useMap } from 'react-leaflet';
import { OCEAN_CONTOURS } from '@/lib/map-data';
import type { Feature } from 'geojson';

const CONTOUR_STYLES: Record<number, L.PathOptions> = {
	1: { color: '#1a1a1a', weight: 1.1, opacity: 0.28, dashArray: '5 2' },
	2: { color: '#1a1a1a', weight: 1.0, opacity: 0.24, dashArray: '4 3' },
	3: { color: '#1a1a1a', weight: 0.9, opacity: 0.20, dashArray: '4 3' },
	4: { color: '#1a1a1a', weight: 0.8, opacity: 0.16, dashArray: '3 4' },
	5: { color: '#1a1a1a', weight: 0.7, opacity: 0.13, dashArray: '3 4' },
	6: { color: '#1a1a1a', weight: 0.6, opacity: 0.10, dashArray: '2 5' },
	7: { color: '#1a1a1a', weight: 0.5, opacity: 0.07, dashArray: '2 6' },
	8: { color: '#1a1a1a', weight: 0.4, opacity: 0.04, dashArray: '2 7' },
};

// Outward coastline echo lines — solid, thin, fading out
const OUTWARD_STYLES: Map<number, L.PathOptions> = new Map([
	[-1, { color: '#1a1a1a', weight: 0.9, opacity: 0.30 }],
	[-2, { color: '#1a1a1a', weight: 0.7, opacity: 0.22 }],
	[-3, { color: '#1a1a1a', weight: 0.5, opacity: 0.15 }],
]);

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
				const baseStyle = depth < 0
					? (OUTWARD_STYLES.get(depth) ?? OUTWARD_STYLES.get(-1)!)
					: (CONTOUR_STYLES[depth] ?? CONTOUR_STYLES[1]);
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
