'use client';

import { useState, useEffect } from 'react';
import { GeoJSON, useMap } from 'react-leaflet';
import { REGION_BOUNDARIES } from '@/lib/map-data';

/**
 * Renders all region polygons as solid paper fills with a bold ink coastline
 * and subtle drop-shadow. Adjacent regions merge into one land mass so the
 * stroke only appears along the actual coastline (not inter-region borders).
 */
const CoastlineShadow = () => {
	const map = useMap();
	const [paneReady, setPaneReady] = useState(false);

	useEffect(() => {
		if (!map.getPane('coastlineShadowPane')) {
			map.createPane('coastlineShadowPane');
			const pane = map.getPane('coastlineShadowPane')!;
			pane.style.zIndex = '140';
			pane.style.filter =
				'drop-shadow(0 0 4px rgba(0, 0, 0, 0.25)) drop-shadow(0 0 1px rgba(0, 0, 0, 0.15))';
		}
		setPaneReady(true);
	}, [map]);

	if (!paneReady) return null;

	return (
		<GeoJSON
			data={REGION_BOUNDARIES}
			style={() => ({
				fillColor: '#F5F3ED',
				fillOpacity: 1,
				color: '#1a1a1a',
				weight: 2.5,
				opacity: 0.7,
				interactive: false,
			})}
			interactive={false}
			pane="coastlineShadowPane"
		/>
	);
};

export default CoastlineShadow;
