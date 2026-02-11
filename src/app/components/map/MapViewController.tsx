'use client';

import { useEffect, useRef } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MAP_CONFIG } from '@/lib/map-data';

interface FocusedRegion {
	regionId: string;
	bounds: L.LatLngBounds;
}

interface MapViewControllerProps {
	focusedRegion: FocusedRegion | null;
	onClearFocus: () => void;
}

const mapBounds = L.latLngBounds(
	L.latLng(MAP_CONFIG.BOUNDS_SW[0], MAP_CONFIG.BOUNDS_SW[1]),
	L.latLng(MAP_CONFIG.BOUNDS_NE[0], MAP_CONFIG.BOUNDS_NE[1])
);

const MapViewController = ({ focusedRegion, onClearFocus }: MapViewControllerProps) => {
	const map = useMap();
	const prevFocusRef = useRef<FocusedRegion | null>(null);

	// Escape key to close focus
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && focusedRegion) {
				onClearFocus();
			}
		};
		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [focusedRegion, onClearFocus]);

	// Click on empty map space to close focus
	useMapEvents({
		click: (e) => {
			if (focusedRegion && !(e as L.LeafletMouseEvent).propagatedFrom) {
				onClearFocus();
			}
		},
	});

	// Animate view on focus change
	useEffect(() => {
		if (focusedRegion && focusedRegion !== prevFocusRef.current) {
			map.fitBounds(focusedRegion.bounds, {
				padding: [40, 40],
				maxZoom: MAP_CONFIG.MAX_ZOOM - 1,
				animate: true,
				duration: 0.8,
			});
		} else if (!focusedRegion && prevFocusRef.current) {
			map.fitBounds(mapBounds, {
				animate: true,
				duration: 0.6,
			});
		}
		prevFocusRef.current = focusedRegion;
	}, [focusedRegion, map]);

	return null;
};

export default MapViewController;
