'use client';

import { useMemo, useState, useEffect } from 'react';
import { Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MAP_REGIONS, REGION_BOUNDARIES, REGION_BIOMES, BIOME_LEGEND } from '@/lib/map-data';
import type { Position } from 'geojson';

const MIN_ZOOM = 3;

// SVG icons for each biome type (12-16px inline SVGs)
const BIOME_ICONS: Record<number, string> = {
	// 0: Marine — no markers
	1: '<svg viewBox="0 0 16 16" width="14" height="14"><path d="M8 14c-1-3-5-4-5-8a5 5 0 0 1 10 0c0 4-4 5-5 8z" fill="#c4a44a" opacity="0.6"/></svg>', // Hot desert — dune
	2: '<svg viewBox="0 0 16 16" width="14" height="14"><path d="M3 13l5-8 5 8z" fill="#8b8878" opacity="0.5"/></svg>', // Cold desert — stone
	3: '<svg viewBox="0 0 16 16" width="12" height="12"><path d="M8 4v8M5 7l3-3 3 3M4 10l4-3 4 3" stroke="#8a9a3a" fill="none" stroke-width="1.5" opacity="0.6"/></svg>', // Savanna — grass
	4: '<svg viewBox="0 0 16 16" width="12" height="12"><path d="M4 12c1-2 2-4 4-4s3 2 4 4M6 12c0.5-1.5 1-3 2-3s1.5 1.5 2 3" stroke="#7a9a3a" fill="none" stroke-width="1.2" opacity="0.55"/></svg>', // Grassland
	5: '<svg viewBox="0 0 16 16" width="14" height="14"><path d="M8 3v10M5 6l3-3 3 3M4 9l4-3 4 3M3 12l5-3 5 3" stroke="#6a8a2a" fill="none" stroke-width="1.2" opacity="0.5"/></svg>', // Tropical seasonal
	6: '<svg viewBox="0 0 16 16" width="14" height="14"><circle cx="8" cy="5" r="4" fill="#3a7a3a" opacity="0.4"/><line x1="8" y1="9" x2="8" y2="14" stroke="#5a4a3a" stroke-width="1.5" opacity="0.5"/></svg>', // Temperate deciduous
	7: '<svg viewBox="0 0 16 16" width="14" height="14"><path d="M8 2c-3 3-4 5-4 7 0 1 1 2 2 2h4c1 0 2-1 2-2 0-2-1-4-4-7z" fill="#4a8a2a" opacity="0.4"/><line x1="8" y1="11" x2="8" y2="15" stroke="#5a4a3a" stroke-width="1.5" opacity="0.5"/></svg>', // Tropical rain
	8: '<svg viewBox="0 0 16 16" width="14" height="14"><circle cx="8" cy="5" r="3.5" fill="#2a6a2a" opacity="0.45"/><line x1="8" y1="8.5" x2="8" y2="14" stroke="#4a3a2a" stroke-width="1.5" opacity="0.5"/></svg>', // Temperate rain
	9: '<svg viewBox="0 0 16 16" width="13" height="13"><path d="M8 2l-3 10h6z" fill="#3a5a2a" opacity="0.45"/><line x1="8" y1="12" x2="8" y2="15" stroke="#4a3a2a" stroke-width="1.2" opacity="0.5"/></svg>', // Taiga — conifer
	10: '<svg viewBox="0 0 16 16" width="12" height="12"><path d="M4 11c1-1 2-2 4-2s3 1 4 2" stroke="#7a6a4a" fill="none" stroke-width="1.5" opacity="0.5"/><circle cx="6" cy="10" r="0.8" fill="#7a6a4a" opacity="0.4"/><circle cx="10" cy="10" r="0.8" fill="#7a6a4a" opacity="0.4"/></svg>', // Tundra
	11: '<svg viewBox="0 0 16 16" width="12" height="12"><path d="M8 3l2 3h-1.5l2 3h-1.5l2 3H5l2-3H5.5l2-3H6z" fill="#9ab8c8" opacity="0.4"/></svg>', // Glacier — snowflake
	12: '<svg viewBox="0 0 16 16" width="12" height="12"><path d="M5 14v-6M8 14v-8M11 14v-5" stroke="#1a7a3a" stroke-width="1.2" opacity="0.45"/><path d="M4 8c1-1 2 0 3 0s2-1 3 0 2 0 3 0" stroke="#1a7a3a" fill="none" stroke-width="1" opacity="0.4"/></svg>', // Wetland — reeds
};

// Simple point-in-polygon test (ray casting)
function pointInPolygon(lng: number, lat: number, ring: Position[]): boolean {
	let inside = false;
	for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
		const xi = ring[i][0], yi = ring[i][1];
		const xj = ring[j][0], yj = ring[j][1];
		if (((yi > lat) !== (yj > lat)) && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi)) {
			inside = !inside;
		}
	}
	return inside;
}

// Seeded pseudo-random for deterministic scatter
function seededRandom(seed: number): () => number {
	let s = seed;
	return () => {
		s = (s * 16807 + 0) % 2147483647;
		return s / 2147483647;
	};
}

interface ScatterPoint {
	lat: number;
	lng: number;
	biomeId: number;
}

function generateScatterPoints(): ScatterPoint[] {
	const points: ScatterPoint[] = [];
	const biomeLookup = new Map(REGION_BIOMES.map((b) => [b.regionId, b]));
	const regionLookup = new Map(MAP_REGIONS.map((r) => [r.id, r]));

	for (const feature of REGION_BOUNDARIES.features) {
		const regionId = feature.properties?.regionId as string;
		if (!regionId || !regionLookup.has(regionId)) continue;

		const biomeData = biomeLookup.get(regionId);
		if (!biomeData || biomeData.biomes.length === 0) continue;

		// Get the polygon rings
		let rings: Position[][];
		if (feature.geometry.type === 'Polygon') {
			rings = [(feature.geometry as GeoJSON.Polygon).coordinates[0]];
		} else if (feature.geometry.type === 'MultiPolygon') {
			rings = (feature.geometry as GeoJSON.MultiPolygon).coordinates.map((p) => p[0]);
		} else {
			continue;
		}

		// For each ring, compute bounding box and scatter points
		const seed = regionId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
		const random = seededRandom(seed);

		for (const ring of rings) {
			let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
			for (const [lng, lat] of ring) {
				if (lng < minLng) minLng = lng;
				if (lng > maxLng) maxLng = lng;
				if (lat < minLat) minLat = lat;
				if (lat > maxLat) maxLat = lat;
			}

			// Scale marker count by area (rough estimate)
			const area = (maxLng - minLng) * (maxLat - minLat);
			const targetCount = Math.max(5, Math.min(40, Math.round(area * 0.02)));
			let placed = 0;
			let attempts = 0;

			while (placed < targetCount && attempts < targetCount * 10) {
				attempts++;
				const lng = minLng + random() * (maxLng - minLng);
				const lat = minLat + random() * (maxLat - minLat);

				if (!pointInPolygon(lng, lat, ring)) continue;

				// Pick biome based on distribution
				const r = random() * 100;
				let cumulative = 0;
				let biomeId = biomeData.dominantBiome;
				for (const b of biomeData.biomes) {
					cumulative += b.percentage;
					if (r <= cumulative) {
						biomeId = b.biomeId;
						break;
					}
				}

				// Skip marine biome markers
				if (biomeId === 0 || !BIOME_ICONS[biomeId]) continue;

				points.push({ lat, lng, biomeId });
				placed++;
			}
		}
	}

	return points;
}

function makeIcon(biomeId: number) {
	const svg = BIOME_ICONS[biomeId];
	if (!svg) return null;
	return L.divIcon({
		className: 'solum-biome-marker',
		html: svg,
		iconSize: [14, 14],
		iconAnchor: [7, 7],
	});
}

// Pre-compute on module load
const scatterPoints = generateScatterPoints();

const BiomeMarkers = () => {
	const map = useMap();
	const [visible, setVisible] = useState(map.getZoom() >= MIN_ZOOM);

	useMapEvents({
		zoomend: () => setVisible(map.getZoom() >= MIN_ZOOM),
	});

	useEffect(() => {
		setVisible(map.getZoom() >= MIN_ZOOM);
	}, [map]);

	// Memoize icons
	const icons = useMemo(() => {
		const cache = new Map<number, L.DivIcon>();
		for (const biomeId of Object.keys(BIOME_ICONS).map(Number)) {
			const icon = makeIcon(biomeId);
			if (icon) cache.set(biomeId, icon);
		}
		return cache;
	}, []);

	if (!visible || scatterPoints.length === 0) return null;

	return (
		<>
			{scatterPoints.map((pt, i) => {
				const icon = icons.get(pt.biomeId);
				if (!icon) return null;
				return (
					<Marker
						key={i}
						position={[pt.lat, pt.lng]}
						icon={icon}
						interactive={false}
						zIndexOffset={-2000}
					/>
				);
			})}
		</>
	);
};

export default BiomeMarkers;
