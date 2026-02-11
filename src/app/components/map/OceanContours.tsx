'use client';

import { useEffect } from 'react';
import { GeoJSON, useMap } from 'react-leaflet';
import { OCEAN_CONTOURS } from '@/lib/map-data';
import type { Feature } from 'geojson';

const CONTOUR_STYLES: Record<number, L.PathOptions> = {
	1: { color: '#8B9DAF', weight: 1.4, opacity: 0.30 },
	2: { color: '#8B9DAF', weight: 1.1, opacity: 0.22 },
	3: { color: '#8B9DAF', weight: 0.9, opacity: 0.16 },
	4: { color: '#8B9DAF', weight: 0.7, opacity: 0.10 },
};

const OceanContours = () => {
	const map = useMap();

	// Create contour pane below tile pane (z-index 200) so land tiles mask contours on land
	useEffect(() => {
		if (!map.getPane('contourPane')) {
			map.createPane('contourPane');
			map.getPane('contourPane')!.style.zIndex = '150';
		}
	}, [map]);

	if (OCEAN_CONTOURS.features.length === 0) return null;

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
