'use client';

import { useCallback, useEffect, useState } from 'react';
import { MapContainer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MAP_CONFIG } from '@/lib/map-data';
import RegionOverlay from './RegionOverlay';
import RegionLabels from './RegionLabels';
import CityLabels from './CityLabels';
import SpotlightMask from './SpotlightMask';
import MapViewController from './MapViewController';
import RegionFocusPanel from './RegionFocusPanel';
import CoastlineShadow from './CoastlineShadow';
import BiomeFillLayer from './BiomeFillLayer';
import OceanContours from './OceanContours';
import LakesLayer from './LakesLayer';
import ReliefLayer from './ReliefLayer';
import RoughBorders from './RoughBorders';
import RegionShadows from './RegionShadows';
import RiversLayer from './RiversLayer';
import GrainOverlay from './GrainOverlay';
import GridLayer from './GridLayer';
import MapCompass from './MapCompass';
import AnnotationLayer from './AnnotationLayer';
import { mdiPencil } from '@mdi/js';

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
	const [annotationsVisible, setAnnotationsVisible] = useState<boolean>(() => {
		if (typeof window === 'undefined') return true;
		return localStorage.getItem('atom-magic-map-annotations-visible') !== 'false';
	});

	useEffect(() => {
		setIsMounted(true);
	}, []);

	const handleRegionFocus = useCallback((regionId: string, bounds: L.LatLngBounds) => {
		setFocusedRegion({ regionId, bounds });
	}, []);

	const handleCloseFocus = useCallback(() => {
		setFocusedRegion(null);
	}, []);

	const toggleAnnotations = useCallback(() => {
		setAnnotationsVisible((v) => {
			const next = !v;
			localStorage.setItem('atom-magic-map-annotations-visible', next ? 'true' : 'false');
			return next;
		});
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
				<BiomeFillLayer />
				<OceanContours />
				<GridLayer />
				<GrainOverlay />
				<LakesLayer />
				<ReliefLayer />
				<RegionOverlay onRegionFocus={handleRegionFocus} />
				<RoughBorders />
				<RegionShadows />
				<RiversLayer />
				<AnnotationLayer visible={annotationsVisible} />
				<RegionLabels focusedRegionId={focusedRegion?.regionId} />
				<CityLabels />
				{focusedRegion && <SpotlightMask focusedRegionId={focusedRegion.regionId} />}
				<MapViewController focusedRegion={focusedRegion} onClearFocus={handleCloseFocus} />
			</MapContainer>
			<MapCompass />
			<button
				onClick={toggleAnnotations}
				title={annotationsVisible ? 'Hide annotations' : 'Show annotations'}
				style={{
					position: 'absolute',
					bottom: '12px',
					left: '12px',
					zIndex: 1000,
					width: '32px',
					height: '32px',
					background: annotationsVisible ? 'rgba(107, 91, 62, 0.85)' : 'rgba(245, 240, 225, 0.85)',
					border: '1px solid rgba(107, 91, 62, 0.4)',
					cursor: 'pointer',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					padding: 0,
				}}
			>
				<svg width={18} height={18} viewBox="0 0 24 24">
					<path
						d={mdiPencil}
						fill={annotationsVisible ? '#F5F0E1' : '#6B5B3E'}
					/>
				</svg>
			</button>
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
