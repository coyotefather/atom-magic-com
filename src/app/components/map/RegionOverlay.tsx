'use client';

import { GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import { MAP_REGIONS, REGION_BOUNDARIES, REGION_BIOMES, BIOME_LEGEND } from '@/lib/map-data';
import type { Layer, LeafletMouseEvent } from 'leaflet';
import type { Feature } from 'geojson';
import { useCallback } from 'react';

const regionMap = new Map(MAP_REGIONS.map((r) => [r.id, r]));
const biomeLookup = new Map(REGION_BIOMES.map((b) => [b.regionId, b]));
const biomeHeightMap = new Map(BIOME_LEGEND.map((b) => [b.id, b.height ?? 0]));

// Compute base fillOpacity per region from dominant biome elevation (0.15–0.30)
function getRegionFillOpacity(regionId: string): number {
	const biomeData = biomeLookup.get(regionId);
	if (!biomeData) return 0.2;
	const height = biomeHeightMap.get(biomeData.dominantBiome) ?? 0;
	return 0.15 + (height / 100) * 0.15;
}

interface RegionOverlayProps {
	onRegionFocus: (regionId: string, bounds: L.LatLngBounds) => void;
}

const RegionOverlay = ({ onRegionFocus }: RegionOverlayProps) => {
	const style = useCallback((feature: Feature | undefined) => {
		const regionId = feature?.properties?.regionId;
		const region = regionId ? regionMap.get(regionId) : undefined;
		return {
			fillColor: region?.color ?? '#888',
			fillOpacity: regionId ? getRegionFillOpacity(regionId) * 0.35 : 0.05,
			color: '#4A3728',
			weight: 1.2,
			opacity: 0.5,
			dashArray: '6 4',
		};
	}, []);

	const onEachFeature = useCallback(
		(feature: Feature, layer: Layer) => {
			const region = feature.properties?.regionId
				? regionMap.get(feature.properties.regionId)
				: undefined;
			if (!region) return;

			// Tooltip
			layer.bindTooltip(
				`<div class="solum-tooltip-content">
					<h3>${region.name}</h3>
					<p>${region.description}</p>
				</div>`,
				{ sticky: true, direction: 'top', offset: [0, -10] }
			);

			// Hover highlight
			layer.on({
				mouseover: (e: LeafletMouseEvent) => {
					const target = e.target;
					target.setStyle({
						fillOpacity: 0.15,
						weight: 2,
						opacity: 0.8,
						dashArray: '',
					});
					target.bringToFront();
				},
				mouseout: (e: LeafletMouseEvent) => {
					const target = e.target;
					target.setStyle({
						fillOpacity: getRegionFillOpacity(region.id) * 0.35,
						weight: 1.2,
						opacity: 0.5,
						dashArray: '6 4',
					});
				},
				click: () => {
					const bounds = L.geoJSON(feature).getBounds();
					onRegionFocus(region.id, bounds);
				},
			});
		},
		[onRegionFocus]
	);

	// Don't render if boundaries are just placeholders (empty coordinates)
	const hasRealBoundaries = REGION_BOUNDARIES.features.some((f) => {
		if (f.geometry.type === 'Polygon') {
			return (f.geometry as GeoJSON.Polygon).coordinates[0].length > 0;
		}
		if (f.geometry.type === 'MultiPolygon') {
			return (f.geometry as GeoJSON.MultiPolygon).coordinates.some(
				(poly) => poly[0].length > 0
			);
		}
		return false;
	});

	if (!hasRealBoundaries) return null;

	return (
		<GeoJSON
			data={REGION_BOUNDARIES}
			style={style}
			onEachFeature={onEachFeature}
		/>
	);
};

export default RegionOverlay;
