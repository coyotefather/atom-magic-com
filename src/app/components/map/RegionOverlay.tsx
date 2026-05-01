/**
 * RegionOverlay.tsx
 *
 * The primary interaction layer for the map. Renders all region boundaries as
 * transparent (invisible) GeoJSON polygons that capture mouse events. This
 * separation of concerns means the visual border drawing (RoughBorders) and
 * the hit-testing (this layer) are independent.
 *
 * Behavior per region polygon:
 *   - Tooltip on hover: shows region name + description via a Leaflet sticky
 *     tooltip positioned above the cursor.
 *   - Hover highlight: subtle dark fill (5% opacity) and slightly bolder
 *     outline while the cursor is over a region.
 *   - Click: calls onRegionFocus(regionId, bounds) which triggers the map to
 *     zoom in (via MapViewController) and opens RegionFocusPanel.
 *
 * The base style uses a dashed outline (dashArray: '8 5') at 35% opacity,
 * making the boundaries just visible enough to guide the eye without competing
 * with the RoughBorders hand-drawn strokes.
 *
 * The component short-circuits to null if REGION_BOUNDARIES contains only
 * empty/placeholder coordinate arrays, so it is safe during development before
 * real GeoJSON data is loaded.
 *
 * Rendering technique: react-leaflet <GeoJSON> component (uses Leaflet's
 * native GeoJSON layer, which renders to an SVG pane automatically). No
 * custom pane is created — this uses Leaflet's default overlay pane.
 *
 * Used by:
 *   - SolumMap.tsx (rendered inside the Leaflet MapContainer)
 */
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
	const style = useCallback((_feature: Feature | undefined) => {
		return {
			fillColor: 'transparent',
			fillOpacity: 0,
			color: '#1a1a1a',
			weight: 1,
			opacity: 0.35,
			dashArray: '8 5',
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
						fillColor: '#1a1a1a',
						fillOpacity: 0.05,
						weight: 1.5,
						opacity: 0.6,
						dashArray: '',
					});
					target.bringToFront();
				},
				mouseout: (e: LeafletMouseEvent) => {
					const target = e.target;
					target.setStyle({
						fillColor: 'transparent',
						fillOpacity: 0,
						weight: 1,
						opacity: 0.35,
						dashArray: '8 5',
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
