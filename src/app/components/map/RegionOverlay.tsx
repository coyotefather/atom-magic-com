'use client';

import { GeoJSON } from 'react-leaflet';
import { useRouter } from 'next/navigation';
import { MAP_REGIONS, REGION_BOUNDARIES } from '@/lib/map-data';
import type { Layer, LeafletMouseEvent } from 'leaflet';
import type { Feature } from 'geojson';
import { useCallback } from 'react';

const regionMap = new Map(MAP_REGIONS.map((r) => [r.id, r]));

const RegionOverlay = () => {
	const router = useRouter();

	const style = useCallback((feature: Feature | undefined) => {
		const region = feature?.properties?.regionId
			? regionMap.get(feature.properties.regionId)
			: undefined;
		return {
			fillColor: region?.color ?? '#888',
			fillOpacity: 0.2,
			color: region?.color ?? '#888',
			weight: 2,
			opacity: 0.6,
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
						fillOpacity: 0.4,
						weight: 3,
						opacity: 0.9,
					});
					target.bringToFront();
				},
				mouseout: (e: LeafletMouseEvent) => {
					const target = e.target;
					target.setStyle({
						fillOpacity: 0.2,
						weight: 2,
						opacity: 0.6,
					});
				},
				click: () => {
					if (region.codexSlug) {
						router.push(`/codex/entries/${region.codexSlug}`);
					}
				},
			});
		},
		[router]
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
