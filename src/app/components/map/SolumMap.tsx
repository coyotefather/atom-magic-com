'use client';

import { useCallback, useEffect, useState } from 'react';
import { MapContainer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MAP_CONFIG } from '@/lib/map-data';
import RegionOverlay from './RegionOverlay';
import RegionLabels from './RegionLabels';
import CapitalMarkers from './CapitalMarkers';
import SpotlightMask from './SpotlightMask';
import MapViewController from './MapViewController';
import RegionFocusPanel from './RegionFocusPanel';
import CoastlineShadow from './CoastlineShadow';
import OceanContours from './OceanContours';
import LakesLayer from './LakesLayer';
import ReliefLayer from './ReliefLayer';
import RegionShadows from './RegionShadows';
import RiversLayer from './RiversLayer';

import 'leaflet/dist/leaflet.css';
import './SolumMap.css';

interface FocusedRegion {
	regionId: string;
	bounds: L.LatLngBounds;
}

const mapBounds = L.latLngBounds(
	L.latLng(MAP_CONFIG.BOUNDS_SW[0], MAP_CONFIG.BOUNDS_SW[1]),
	L.latLng(MAP_CONFIG.BOUNDS_NE[0], MAP_CONFIG.BOUNDS_NE[1])
);

/** Sets minZoom to the level that snugly fits the full map in the viewport. */
const ZoomConstraint = () => {
	const map = useMap();
	useEffect(() => {
		const fitZoom = map.getBoundsZoom(mapBounds);
		map.setMinZoom(fitZoom);
		map.fitBounds(mapBounds);
	}, [map]);
	return null;
};

const SolumMap = () => {
	const [isMounted, setIsMounted] = useState(false);
	const [focusedRegion, setFocusedRegion] = useState<FocusedRegion | null>(null);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	const handleRegionFocus = useCallback((regionId: string, bounds: L.LatLngBounds) => {
		setFocusedRegion({ regionId, bounds });
	}, []);

	const handleCloseFocus = useCallback(() => {
		setFocusedRegion(null);
	}, []);

	if (!isMounted) {
		return (
			<div
				className="w-full bg-parchment border-2 border-stone flex items-center justify-center"
				style={{ aspectRatio: `${MAP_CONFIG.SVG_WIDTH} / ${MAP_CONFIG.SVG_HEIGHT}`, maxHeight: '75vh' }}
			>
				<p className="text-stone-dark marcellus">Loading map...</p>
			</div>
		);
	}

	return (
		<div className="relative">
			{/* Hidden SVG filter definitions for hand-drawn map aesthetic */}
			<svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
				<defs>
					{/* Subtle wobble for region borders, coastlines, contours, rivers */}
					<filter id="solum-pencil" x="-2%" y="-2%" width="104%" height="104%">
						<feTurbulence type="turbulence" baseFrequency="0.04" numOctaves="3" seed="2" result="noise" />
						<feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" />
					</filter>
					{/* Slightly stronger wobble for the coastline shadow and region borders */}
					<filter id="solum-ink" x="-3%" y="-3%" width="106%" height="106%">
						<feTurbulence type="turbulence" baseFrequency="0.03" numOctaves="4" seed="7" result="noise" />
						<feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
					</filter>
				</defs>
			</svg>
			<MapContainer
				crs={L.CRS.Simple}
				bounds={mapBounds}
				maxBounds={mapBounds.pad(0.1)}
				maxBoundsViscosity={1.0}
				maxZoom={7}
				zoomControl={true}
				scrollWheelZoom={true}
				attributionControl={false}
				className="solum-map w-full"
				style={{ aspectRatio: `${MAP_CONFIG.SVG_WIDTH} / ${MAP_CONFIG.SVG_HEIGHT}`, maxHeight: '75vh' }}
			>
				<ZoomConstraint />
				<CoastlineShadow />
				<OceanContours />
				<LakesLayer />
				<ReliefLayer />
				<RegionOverlay onRegionFocus={handleRegionFocus} />
				<RegionShadows />
				<RiversLayer />
				<RegionLabels focusedRegionId={focusedRegion?.regionId} />
				<CapitalMarkers />
				{focusedRegion && <SpotlightMask focusedRegionId={focusedRegion.regionId} />}
				<MapViewController focusedRegion={focusedRegion} onClearFocus={handleCloseFocus} />
			</MapContainer>
			{focusedRegion && (
				<RegionFocusPanel
					regionId={focusedRegion.regionId}
					onClose={handleCloseFocus}
				/>
			)}
		</div>
	);
};

export default SolumMap;
