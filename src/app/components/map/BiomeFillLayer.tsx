'use client';

import { useState, useEffect } from 'react';
import { SVGOverlay, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MAP_CONFIG, REGION_BOUNDARIES, REGION_BIOMES, MAP_REGIONS } from '@/lib/map-data';

// Parchment-wash colours per Azgaar biome ID — very light tints at low opacity
const BIOME_FILL_COLORS: Record<number, string> = {
	11: '#DDD8C8', // Glacier — cool cream
	9:  '#B8BF90', // Taiga — muted sage
	6:  '#B5BF8C', // Temperate deciduous — sage-green
	8:  '#B2BE88', // Temperate rain — medium sage
	7:  '#B0BC80', // Tropical rain — deeper sage
	5:  '#B8C090', // Tropical seasonal — lighter sage
	4:  '#C8C898', // Grassland — warm tan-green
	3:  '#CCC498', // Savanna — warm tan
	2:  '#CCBA88', // Cold desert — sandy
	1:  '#D0B870', // Hot desert — warm ochre
	10: '#C8C098', // Tundra — warm tan
	12: '#A0AC88', // Wetland — grey-olive
};

const DEFAULT_FILL = '#C8C090';
const DEAD_LAND_FILL = '#7D7060'; // darker muted olive — keeps TM visually distinct

// Build lookups once at module load
const regionBiomeMap = new Map(REGION_BIOMES.map((b) => [b.regionId, b.dominantBiome]));
const regionNameMap = new Map(MAP_REGIONS.map((r) => [r.id, r.name]));

function getRegionFill(regionId: string): string {
	const name = regionNameMap.get(regionId) ?? '';
	if (name.includes('Terrae Mortuae')) return DEAD_LAND_FILL;
	const biomeId = regionBiomeMap.get(regionId);
	if (biomeId === undefined) return DEFAULT_FILL;
	return BIOME_FILL_COLORS[biomeId] ?? DEFAULT_FILL;
}

function ringToSvgPath(ring: number[][]): string {
	return (
		ring
			.map((coord, i) => {
				const x = coord[0] * 32;
				const y = -coord[1] * 32;
				return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
			})
			.join(' ') + ' Z'
	);
}

const BiomeFillLayer = () => {
	const map = useMap();
	const [paneReady, setPaneReady] = useState(false);

	useEffect(() => {
		if (!map.getPane('biomeFillPane')) {
			map.createPane('biomeFillPane');
		}
		map.getPane('biomeFillPane')!.style.zIndex = '145';
		setPaneReady(true);
	}, [map]);

	if (!paneReady) return null;

	const bounds = L.latLngBounds(
		L.latLng(MAP_CONFIG.BOUNDS_SW[0], MAP_CONFIG.BOUNDS_SW[1]),
		L.latLng(MAP_CONFIG.BOUNDS_NE[0], MAP_CONFIG.BOUNDS_NE[1])
	);

	return (
		<SVGOverlay bounds={bounds} pane="biomeFillPane" interactive={false}>
			<svg
				viewBox={`0 0 ${MAP_CONFIG.SVG_WIDTH} ${MAP_CONFIG.SVG_HEIGHT}`}
				preserveAspectRatio="none"
			>
				{REGION_BOUNDARIES.features.map((feature, i) => {
					const regionId = feature.properties?.regionId as string | undefined;
					const fill = regionId ? getRegionFill(regionId) : DEFAULT_FILL;
					const geom = feature.geometry;

					if (geom.type === 'Polygon') {
						const d = ringToSvgPath(geom.coordinates[0] as number[][]);
						return <path key={i} d={d} fill={fill} fillOpacity={0.3} stroke="none" />;
					}
					if (geom.type === 'MultiPolygon') {
						const d = (geom.coordinates as number[][][][])
							.map((poly) => ringToSvgPath(poly[0]))
							.join(' ');
						return <path key={i} d={d} fill={fill} fillOpacity={0.3} stroke="none" />;
					}
					return null;
				})}
			</svg>
		</SVGOverlay>
	);
};

export default BiomeFillLayer;
