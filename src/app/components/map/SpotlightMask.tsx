'use client';

import { useEffect, useMemo } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { REGION_BOUNDARIES, MAP_CONFIG } from '@/lib/map-data';

interface SpotlightMaskProps {
	focusedRegionId: string;
}

const SpotlightMask = ({ focusedRegionId }: SpotlightMaskProps) => {
	const map = useMap();

	const maskData = useMemo(() => {
		const feature = REGION_BOUNDARIES.features.find(
			(f) => f.properties?.regionId === focusedRegionId
		);
		if (!feature) return null;

		// Outer ring: covers entire map bounds with padding
		const sw = MAP_CONFIG.BOUNDS_SW;
		const ne = MAP_CONFIG.BOUNDS_NE;
		const pad = 5;
		const outerRing: L.LatLngExpression[] = [
			[sw[0] - pad, sw[1] - pad],
			[sw[0] - pad, ne[1] + pad],
			[ne[0] + pad, ne[1] + pad],
			[ne[0] + pad, sw[1] - pad],
		];

		// Inner holes: the focused region's polygon rings
		// GeoJSON is [lng, lat], Leaflet needs [lat, lng]
		const holes: L.LatLngExpression[][] = [];
		if (feature.geometry.type === 'Polygon') {
			const ring = (feature.geometry as GeoJSON.Polygon).coordinates[0];
			holes.push(ring.map(([lng, lat]) => [lat, lng] as L.LatLngExpression));
		} else if (feature.geometry.type === 'MultiPolygon') {
			for (const polygon of (feature.geometry as GeoJSON.MultiPolygon).coordinates) {
				holes.push(polygon[0].map(([lng, lat]) => [lat, lng] as L.LatLngExpression));
			}
		}

		return { outerRing, holes };
	}, [focusedRegionId]);

	useEffect(() => {
		if (!maskData) return;

		// Ensure the spotlight pane exists
		if (!map.getPane('spotlightPane')) {
			map.createPane('spotlightPane');
			map.getPane('spotlightPane')!.style.zIndex = '450';
		}

		const polygon = L.polygon(
			[maskData.outerRing, ...maskData.holes],
			{
				color: 'transparent',
				fillColor: '#1a1a1a',
				fillOpacity: 0.55,
				interactive: false,
				pane: 'spotlightPane',
			}
		);

		polygon.addTo(map);

		return () => {
			map.removeLayer(polygon);
		};
	}, [map, maskData]);

	return null;
};

export default SpotlightMask;
