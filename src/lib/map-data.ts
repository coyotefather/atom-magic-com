import type { FeatureCollection, Feature, Polygon } from 'geojson';

export interface MapRegion {
	id: string;
	name: string;
	description: string;
	codexSlug?: string;
	color: string;
}

/**
 * Map configuration for Solum.
 * IMAGE_WIDTH and IMAGE_HEIGHT should match the source PNG dimensions.
 * Update these after running the tile generation script.
 */
export const MAP_CONFIG = {
	/** Width of the source map image in pixels */
	IMAGE_WIDTH: 8192,
	/** Height of the source map image in pixels */
	IMAGE_HEIGHT: 8192,
	/** Minimum zoom level (0 = full map in ~1 tile) */
	MIN_ZOOM: 0,
	/** Maximum zoom level */
	MAX_ZOOM: 4,
	/** Default zoom level on load */
	DEFAULT_ZOOM: 1,
	/** Tile size in pixels */
	TILE_SIZE: 256,
};

/**
 * Region metadata — maps region IDs to display info and Codex slugs.
 * Populate these once you know the Azgaar state/culture IDs and
 * have corresponding Codex entries.
 */
export const MAP_REGIONS: MapRegion[] = [
	{
		id: 'spiranos-heartlands',
		name: 'Spiranos Heartlands',
		description: 'The ancestral homeland of the Spiranos, seat of the Imperium.',
		codexSlug: 'spiranos',
		color: '#C9A227',
	},
	{
		id: 'boreanos-reaches',
		name: 'Boreanos Reaches',
		description: 'Northern territories of the resilient Boreanos people.',
		codexSlug: 'boreanos',
		color: '#4A7C59',
	},
	{
		id: 'autogena-wilds',
		name: 'Autogena Wilds',
		description: 'The living lands of the Autogena, where nature and magic intertwine.',
		codexSlug: 'autogena',
		color: '#CD7F32',
	},
	{
		id: 'umbra-dominion',
		name: 'Umbra Dominion',
		description: 'Shadowed realm of the enigmatic Umbra.',
		codexSlug: 'umbra',
		color: '#5C5C5C',
	},
	{
		id: 'terrae-mortuae',
		name: 'Terrae Mortuae',
		description: 'The dead lands. What lies beyond is unknown.',
		color: '#3D2B1F',
	},
];

/**
 * GeoJSON FeatureCollection for region boundaries.
 *
 * PLACEHOLDER: Replace with actual boundaries exported from Azgaar.
 * Coordinates should be in the same pixel coordinate space as the
 * tile layer (y increases downward, matching Leaflet CRS.Simple with
 * bounds [[0, 0], [IMAGE_HEIGHT, IMAGE_WIDTH]]).
 *
 * Each Feature's `properties.regionId` should match a MapRegion.id above.
 */
export const REGION_BOUNDARIES: FeatureCollection = {
	type: 'FeatureCollection',
	features: MAP_REGIONS.map((region): Feature<Polygon> => ({
		type: 'Feature',
		properties: { regionId: region.id },
		geometry: {
			type: 'Polygon',
			// Placeholder empty polygon — replace with real coordinates
			coordinates: [[]],
		},
	})),
};
