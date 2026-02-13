'use client';

import { useState, useEffect } from 'react';
import { GeoJSON, useMap } from 'react-leaflet';
import { REGION_BOUNDARIES } from '@/lib/map-data';

/**
 * Renders all region polygons as solid parchment fills in a filtered pane.
 * Adjacent regions merge visually into one land mass, and the CSS drop-shadow
 * creates a dark glow along coastlines only (not inter-region borders).
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
				'drop-shadow(0 0 8px rgba(50, 35, 20, 0.35)) drop-shadow(0 0 3px rgba(50, 35, 20, 0.2))';
		}
		setPaneReady(true);
	}, [map]);

	if (!paneReady) return null;

	return (
		<GeoJSON
			data={REGION_BOUNDARIES}
			style={() => ({
				fillColor: '#F2EBD9',
				fillOpacity: 1,
				stroke: false,
				interactive: false,
			})}
			interactive={false}
			pane="coastlineShadowPane"
		/>
	);
};

export default CoastlineShadow;
