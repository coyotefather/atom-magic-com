/**
 * RegionShadows.tsx
 *
 * Adds a soft shadow/vignette effect along all region border lines by
 * rendering the same REGION_BOUNDARIES GeoJSON with a thick (weight 6),
 * nearly transparent (4% opacity) dark stroke and no fill. The wide stroke
 * bleeds inward on both sides of each border, creating a subtle darkening
 * near territory edges that adds depth without drawing a hard line.
 *
 * This is separate from RoughBorders (which draws the visible ink lines) and
 * from RegionOverlay (which handles mouse interaction). RegionShadows is
 * purely decorative shading.
 *
 * Rendering technique: react-leaflet <GeoJSON> component rendered into a
 * custom Leaflet pane ("regionShadowPane", z-index 395). The `interactive`
 * prop is set to false so this layer does not absorb mouse events.
 *
 * Used by:
 *   - SolumMap.tsx (rendered inside the Leaflet MapContainer)
 */
'use client';

import { useState, useEffect } from 'react';
import { GeoJSON, useMap } from 'react-leaflet';
import { REGION_BOUNDARIES } from '@/lib/map-data';
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
				color: '#1a1a1a',
				weight: 6,
				opacity: 0.04,
				interactive: false,
			})}
			interactive={false}
			pane="regionShadowPane"
		/>
	);
};

export default RegionShadows;
