'use client';

import { useEffect, useRef } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

interface FocusedRegion {
	regionId: string;
	bounds: L.LatLngBounds;
}

interface MapViewControllerProps {
	focusedRegion: FocusedRegion | null;
	onClearFocus: () => void;
}

interface SavedView {
	center: L.LatLng;
	zoom: number;
}

const MapViewController = ({ focusedRegion, onClearFocus }: MapViewControllerProps) => {
	const map = useMap();
	const prevFocusRef = useRef<FocusedRegion | null>(null);
	const savedViewRef = useRef<SavedView | null>(null);

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
			// Save current view before zooming in
			if (!savedViewRef.current) {
				savedViewRef.current = {
					center: map.getCenter(),
					zoom: map.getZoom(),
				};
			}
			map.fitBounds(focusedRegion.bounds, {
				padding: [40, 40],
				animate: true,
				duration: 0.8,
			});
		} else if (!focusedRegion && prevFocusRef.current) {
			// Restore previous view
			if (savedViewRef.current) {
				map.setView(savedViewRef.current.center, savedViewRef.current.zoom, {
					animate: true,
					duration: 0.6,
				});
				savedViewRef.current = null;
			}
		}
		prevFocusRef.current = focusedRegion;
	}, [focusedRegion, map]);

	return null;
};

export default MapViewController;
