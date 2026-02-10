'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import { MAP_CONFIG } from '@/lib/map-data';
import RegionOverlay from './RegionOverlay';

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

	// Leaflet CRS.Simple maps [y, x] directly to pixel coordinates.
	// Bounds define the map extents in [lat, lng] where lat = y, lng = x.
	const bounds = L.latLngBounds(
		L.latLng(0, 0),
		L.latLng(MAP_CONFIG.IMAGE_HEIGHT, MAP_CONFIG.IMAGE_WIDTH)
	);

	const center = bounds.getCenter();

	return (
		<MapContainer
			crs={L.CRS.Simple}
			bounds={bounds}
			maxBounds={bounds.pad(0.1)}
			maxBoundsViscosity={1.0}
			center={center}
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
				errorTileUrl=""
			/>
			<RegionOverlay />
		</MapContainer>
	);
};

export default SolumMap;
