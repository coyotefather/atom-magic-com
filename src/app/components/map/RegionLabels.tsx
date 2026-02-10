'use client';

import { useEffect, useState } from 'react';
import { Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MAP_REGIONS, REGION_BOUNDARIES } from '@/lib/map-data';
import type { Position } from 'geojson';

const MIN_ZOOM = 2;

// Font sizes by zoom level
const ZOOM_FONT_SIZE: Record<number, number> = {
	2: 10,
	3: 12,
	4: 14,
	5: 16,
};

function centroid(ring: Position[]): [number, number] {
	let sumLng = 0;
	let sumLat = 0;
	// Exclude the closing vertex (same as first)
	const count = ring.length > 1 && ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1]
		? ring.length - 1
		: ring.length;
	for (let i = 0; i < count; i++) {
		sumLng += ring[i][0];
		sumLat += ring[i][1];
	}
	return [sumLat / count, sumLng / count]; // [lat, lng]
}

function largestRingCentroid(coordinates: Position[][][]): [number, number] {
	let largest = coordinates[0][0];
	let maxLen = largest.length;
	for (let i = 1; i < coordinates.length; i++) {
		if (coordinates[i][0].length > maxLen) {
			largest = coordinates[i][0];
			maxLen = largest.length;
		}
	}
	return centroid(largest);
}

interface LabelData {
	regionId: string;
	name: string;
	position: [number, number];
}

function computeLabels(): LabelData[] {
	const regionMap = new Map(MAP_REGIONS.map((r) => [r.id, r]));
	const labels: LabelData[] = [];

	for (const feature of REGION_BOUNDARIES.features) {
		const regionId = feature.properties?.regionId;
		const region = regionId ? regionMap.get(regionId) : undefined;
		if (!region) continue;

		let position: [number, number];
		if (feature.geometry.type === 'Polygon') {
			position = centroid(feature.geometry.coordinates[0] as Position[]);
		} else if (feature.geometry.type === 'MultiPolygon') {
			position = largestRingCentroid(feature.geometry.coordinates as Position[][][]);
		} else {
			continue;
		}

		labels.push({ regionId: region.id, name: region.name, position });
	}

	return labels;
}

const labels = computeLabels();

function makeIcon(name: string, fontSize: number) {
	return L.divIcon({
		className: 'solum-region-label',
		html: `<span style="font-size:${fontSize}px">${name}</span>`,
		iconSize: [0, 0],
		iconAnchor: [0, 0],
	});
}

const RegionLabels = () => {
	const map = useMap();
	const [zoom, setZoom] = useState(map.getZoom());

	useMapEvents({
		zoomend: () => setZoom(map.getZoom()),
	});

	useEffect(() => {
		setZoom(map.getZoom());
	}, [map]);

	if (zoom < MIN_ZOOM || labels.length === 0) return null;

	const fontSize = ZOOM_FONT_SIZE[zoom] ?? 16;

	return (
		<>
			{labels.map((label) => (
				<Marker
					key={label.regionId}
					position={label.position}
					icon={makeIcon(label.name, fontSize)}
					interactive={false}
					zIndexOffset={-1000}
				/>
			))}
		</>
	);
};

export default RegionLabels;
