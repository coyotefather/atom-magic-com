/**
 * SolumMap.tsx
 *
 * Root component for the interactive world map of Solum. Owns all top-level
 * map state and composes every visual layer into a single Leaflet MapContainer.
 *
 * Map setup:
 *   - Uses Leaflet's CRS.Simple coordinate reference system (no geographic
 *     projection). Coordinates are plain pixel values derived from the SVG
 *     source: x = lng * 32, y = -lat * 32, giving a canvas of
 *     MAP_CONFIG.SVG_WIDTH × MAP_CONFIG.SVG_HEIGHT pixels at max zoom.
 *   - maxBounds padded 10% with viscosity 1.0, so the user cannot pan outside
 *     the map.
 *   - ZoomConstraint (inner component) dynamically sets minZoom on mount to
 *     the exact level where the full map fits the viewport, preventing
 *     excessive zoom-out.
 *
 * State managed here:
 *   - `focusedRegion` — the currently selected region (id + bounds). Passed to
 *     MapViewController (which animates the camera), RegionFocusPanel (which
 *     shows region info), SpotlightMask (which darkens the non-focused area),
 *     and RegionLabels (which filters labels to the focused region only).
 *   - `annotationsVisible` — whether AnnotationLayer renders. Persisted to
 *     localStorage. A pencil-icon toggle button in the bottom-left corner
 *     controls this.
 *   - `isMounted` — guards against SSR/hydration issues; the map only renders
 *     after the component mounts in the browser.
 *
 * Layer render order (see full stack in component body):
 *   CoastlineShadow → BiomeFillLayer → OceanContours → OceanLabels →
 *   GridLayer → GrainOverlay → LakesLayer → ReliefLayer → RegionOverlay →
 *   RoughBorders → RegionShadows → RiversLayer → AnnotationLayer →
 *   RegionLabels → CityLabels → (SpotlightMask when focused)
 *
 * MapCompass and RegionFocusPanel are rendered outside the MapContainer in a
 * relative wrapper div, overlaid using absolute positioning at z-index 1000.
 *
 * Used by:
 *   - MapContainer.tsx (lazy-loaded with SSR disabled via next/dynamic)
 */
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
import OceanLabels from './OceanLabels';
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
				<OceanLabels />
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
