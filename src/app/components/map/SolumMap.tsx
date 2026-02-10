'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import { MAP_CONFIG } from '@/lib/map-data';
import RegionOverlay from './RegionOverlay';
import RegionLabels from './RegionLabels';
import CapitalMarkers from './CapitalMarkers';

import 'leaflet/dist/leaflet.css';
import './SolumMap.css';

const SolumMap = () => {
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	if (!isMounted) {
		return (
			<div
				className="w-full bg-parchment border-2 border-stone flex items-center justify-center"
				style={{ aspectRatio: `${MAP_CONFIG.IMAGE_WIDTH} / ${MAP_CONFIG.IMAGE_HEIGHT}`, maxHeight: '75vh' }}
			>
				<p className="text-stone-dark marcellus">Loading map...</p>
			</div>
		);
	}

	// CRS.Simple bounds derived from image pixel dimensions at maxZoom.
	// Pixel (px, py) at maxZoom → CRS latLng(-py / 2^maxZoom, px / 2^maxZoom).
	// This ensures tiles and GeoJSON share the same coordinate space.
	const bounds = L.latLngBounds(
		L.latLng(MAP_CONFIG.BOUNDS_SW[0], MAP_CONFIG.BOUNDS_SW[1]),
		L.latLng(MAP_CONFIG.BOUNDS_NE[0], MAP_CONFIG.BOUNDS_NE[1])
	);

	return (
		<MapContainer
			crs={L.CRS.Simple}
			bounds={bounds}
			maxBounds={bounds.pad(0.1)}
			maxBoundsViscosity={1.0}
			center={bounds.getCenter()}
			zoom={MAP_CONFIG.DEFAULT_ZOOM}
			minZoom={MAP_CONFIG.MIN_ZOOM}
			maxZoom={MAP_CONFIG.MAX_ZOOM}
			zoomControl={true}
			scrollWheelZoom={true}
			attributionControl={false}
			className="solum-map w-full"
			style={{ aspectRatio: `${MAP_CONFIG.IMAGE_WIDTH} / ${MAP_CONFIG.IMAGE_HEIGHT}`, maxHeight: '75vh' }}
		>
			<TileLayer
				url="/map/tiles/{z}/{x}/{y}.png"
				tileSize={MAP_CONFIG.TILE_SIZE}
				noWrap={true}
				bounds={bounds}
				maxNativeZoom={MAP_CONFIG.MAX_ZOOM}
				errorTileUrl=""
			/>
			<RegionOverlay />
			<RegionLabels />
			<CapitalMarkers />
		</MapContainer>
	);
};

export default SolumMap;
