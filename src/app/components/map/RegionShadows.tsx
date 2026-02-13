'use client';

import { useState, useEffect } from 'react';
import { GeoJSON, useMap } from 'react-leaflet';
import { REGION_BOUNDARIES } from '@/lib/map-data';

/**
 * Renders thick semi-transparent strokes along region borders to create
 * a subtle inner shadow / vignette effect at territory edges.
 */
const RegionShadows = () => {
	const map = useMap();
	const [paneReady, setPaneReady] = useState(false);

	useEffect(() => {
		if (!map.getPane('regionShadowPane')) {
			map.createPane('regionShadowPane');
			map.getPane('regionShadowPane')!.style.zIndex = '395';
		}
		setPaneReady(true);
	}, [map]);

	if (!paneReady) return null;

	return (
		<GeoJSON
			data={REGION_BOUNDARIES}
			style={() => ({
				fill: false,
				color: '#3D2B1F',
				weight: 8,
				opacity: 0.06,
				interactive: false,
			})}
			interactive={false}
			pane="regionShadowPane"
		/>
	);
};

export default RegionShadows;
