'use client';

import { useState, useEffect } from 'react';
import { SVGOverlay, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MAP_CONFIG, MAP_REGIONS, REGION_BOUNDARIES } from '@/lib/map-data';
import type { Position } from 'geojson';

const DIVISOR = 32; // 2^maxZoom

function centroid(ring: Position[]): [number, number] {
	let sumLng = 0;
	let sumLat = 0;
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
	svgX: number;
	svgY: number;
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

		const [lat, lng] = position;
		labels.push({
			regionId: region.id,
			name: region.name,
			svgX: lng * DIVISOR,
			svgY: -lat * DIVISOR,
		});
	}

	return labels;
}

const labels = computeLabels();

const bounds = L.latLngBounds(
	L.latLng(MAP_CONFIG.BOUNDS_SW[0], MAP_CONFIG.BOUNDS_SW[1]),
	L.latLng(MAP_CONFIG.BOUNDS_NE[0], MAP_CONFIG.BOUNDS_NE[1])
);

interface RegionLabelsProps {
	focusedRegionId?: string | null;
}

const RegionLabels = ({ focusedRegionId }: RegionLabelsProps) => {
	const map = useMap();
	const [paneReady, setPaneReady] = useState(false);

	useEffect(() => {
		if (!map.getPane('regionLabelsPane')) {
			map.createPane('regionLabelsPane');
			map.getPane('regionLabelsPane')!.style.zIndex = '500';
			map.getPane('regionLabelsPane')!.style.pointerEvents = 'none';
		}
		setPaneReady(true);
	}, [map]);

	if (!paneReady || labels.length === 0) return null;

	const visibleLabels = focusedRegionId
		? labels.filter((l) => l.regionId === focusedRegionId)
		: labels;

	return (
		<SVGOverlay bounds={bounds} pane="regionLabelsPane" interactive={false}>
			<svg viewBox={`0 0 ${MAP_CONFIG.SVG_WIDTH} ${MAP_CONFIG.SVG_HEIGHT}`} preserveAspectRatio="none">
				{visibleLabels.map((label) => (
					<text
						key={label.regionId}
						x={label.svgX}
						y={label.svgY}
						textAnchor="middle"
						dominantBaseline="central"
						fontFamily="'Marcellus', serif"
						fontSize="9"
						fill="#8B2500"
						letterSpacing="0.2em"
						textDecoration="none"
						paintOrder="stroke fill"
						stroke="#F5F3ED"
						strokeWidth="3"
						strokeLinejoin="round"
						style={{ textTransform: 'uppercase' as const }}
					>
						{label.name}
					</text>
				))}
			</svg>
		</SVGOverlay>
	);
};

export default RegionLabels;
