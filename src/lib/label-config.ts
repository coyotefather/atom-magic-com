import { MAP_REGIONS, MAP_CAPITALS, REGION_BOUNDARIES, MAP_CITIES } from '@/lib/map-data';
import type { Position } from 'geojson';

const DIVISOR = 32; // 2^maxZoom

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface LabelConfig {
	regionId: string;
	name: string;
	svgX: number;
	svgY: number;
	angle: number;
	dx: number;
	dy: number;
	fontSize: number;
}

export interface CapitalConfig {
	id: number;
	name: string;
	svgX: number;
	svgY: number;
}

export interface LabelBBox {
	cx: number;
	cy: number;
	halfW: number;
	halfH: number;
	angle: number;
}

interface LabelOverride {
	angle?: number;
	dx?: number;
	dy?: number;
	fontSize?: number;
}

// ---------------------------------------------------------------------------
// Per-region overrides (angles at 0 for now; will be tuned later)
// ---------------------------------------------------------------------------

const LABEL_OVERRIDES: Record<string, LabelOverride> = {
	'state-1': { angle: -8 },      // Soli Minor
	'state-2': { angle: 25 },      // Austellus (capped from 40)
	'state-3': { angle: 25 },      // Cassis Minor (capped from 26)
	'state-4': { angle: -24 },     // W Terrae Mortuae
	'state-5': { angle: 25 },      // E Terrae Mortuae (capped from 37)
	'state-8': { angle: -10 },     // Cassis Major (PCA 80° → perpendicular, use -10)
	'state-9': { angle: 6 },       // Terrae Liberae
	'state-10': { angle: 25 },     // Circeii (capped from 27)
	'state-11': { angle: -25 },    // Praesidium (capped from -37)
	'state-12': { angle: -21 },    // Isospora
	'state-13': { angle: 3 },      // Aetos
	'state-14': { angle: 16 },     // Hesperia
	'state-15': { angle: -3 },     // Aquilo
	'state-16': { angle: -13 },    // Aquilo Novus
	'state-17': { angle: 25 },     // Insula Palmaris (capped from 49)
};

// ---------------------------------------------------------------------------
// Centroid helpers
// ---------------------------------------------------------------------------

function centroid(ring: Position[]): [number, number] {
	let sumLng = 0;
	let sumLat = 0;
	const count =
		ring.length > 1 &&
		ring[0][0] === ring[ring.length - 1][0] &&
		ring[0][1] === ring[ring.length - 1][1]
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

// ---------------------------------------------------------------------------
// Compute label configs from region boundaries
// ---------------------------------------------------------------------------

function computeLabelConfigs(): LabelConfig[] {
	const regionMap = new Map(MAP_REGIONS.map((r) => [r.id, r]));
	const configs: LabelConfig[] = [];

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
		const overrides = LABEL_OVERRIDES[region.id] ?? {};

		configs.push({
			regionId: region.id,
			name: region.name,
			svgX: lng * DIVISOR + (overrides.dx ?? 0),
			svgY: -lat * DIVISOR + (overrides.dy ?? 0),
			angle: overrides.angle ?? 0,
			dx: overrides.dx ?? 0,
			dy: overrides.dy ?? 0,
			fontSize: overrides.fontSize ?? 9,
		});
	}

	return configs;
}

// ---------------------------------------------------------------------------
// Compute capital configs
// ---------------------------------------------------------------------------

function computeCapitalConfigs(): CapitalConfig[] {
	return MAP_CAPITALS.map((capital) => ({
		id: capital.id,
		name: capital.name,
		svgX: capital.lng * DIVISOR,
		svgY: -capital.lat * DIVISOR,
	}));
}

// ---------------------------------------------------------------------------
// Clearance zones for relief placement avoidance
// ---------------------------------------------------------------------------

export function computeClearanceZones(padding: number): LabelBBox[] {
	const zones: LabelBBox[] = [];

	// Region labels: approximate text width as name.length * 5.5 (fontSize 9, letter-spacing)
	for (const label of LABEL_CONFIGS) {
		const textWidth = label.name.length * 5.5;
		const textHeight = label.fontSize * 1.2;
		zones.push({
			cx: label.svgX,
			cy: label.svgY,
			halfW: textWidth / 2 + padding,
			halfH: textHeight / 2 + padding,
			angle: label.angle,
		});
	}

	// Capital labels: approximate text width as name.length * 3.5 (fontSize 5)
	for (const capital of CAPITAL_CONFIGS) {
		const textWidth = capital.name.length * 3.5;
		const textHeight = 5 * 1.2;
		// Capital text is offset +3 from the dot, so center is shifted
		zones.push({
			cx: capital.svgX + 3 + textWidth / 2,
			cy: capital.svgY,
			halfW: textWidth / 2 + padding,
			halfH: textHeight / 2 + padding,
			angle: 0,
		});
	}

	// Non-capital city labels: text offset +2 from dot, fontSize 3
	for (const city of MAP_CITIES.filter((c) => !c.capital)) {
		const textWidth = city.name.length * 2.0;
		const textHeight = 3 * 1.2;
		zones.push({
			cx: city.svgX + 2 + textWidth / 2,
			cy: city.svgY,
			halfW: textWidth / 2 + padding,
			halfH: textHeight / 2 + padding,
			angle: 0,
		});
	}

	return zones;
}

// ---------------------------------------------------------------------------
// Automatic label deconfliction
// ---------------------------------------------------------------------------

export function deconflictLabels(configs: LabelConfig[]): LabelConfig[] {
	const CHAR_WIDTH_FACTOR = 0.52;
	const LINE_HEIGHT = 1.25;
	const PADDING = 3;

	interface Box { cx: number; cy: number; hw: number; hh: number }

	function getBox(label: LabelConfig, svgX: number, svgY: number): Box {
		const words = label.name.split(/\s+/);
		const maxWordLen = Math.max(...words.map((w) => w.length));
		const hw = (maxWordLen * label.fontSize * CHAR_WIDTH_FACTOR) / 2 + PADDING;
		const hh = (words.length * label.fontSize * LINE_HEIGHT) / 2 + PADDING;
		return { cx: svgX, cy: svgY, hw, hh };
	}

	function overlaps(a: Box, b: Box): boolean {
		return (
			Math.abs(a.cx - b.cx) < a.hw + b.hw &&
			Math.abs(a.cy - b.cy) < a.hh + b.hh
		);
	}

	// Pre-seed placed[] with capital city label bounding boxes as fixed obstacles.
	// Capital text is rendered at fontSize=5, offset +3 from the dot.
	const placed: Array<{ id: string; box: Box }> = MAP_CITIES
		.filter((c) => c.capital)
		.map((city) => {
			const textWidth = city.name.length * 5 * CHAR_WIDTH_FACTOR;
			const textHeight = 5 * LINE_HEIGHT;
			return {
				id: `_capital_${city.i}`,
				box: {
					cx: city.svgX + 3 + textWidth / 2,
					cy: city.svgY,
					hw: textWidth / 2 + PADDING,
					hh: textHeight / 2 + PADDING,
				},
			};
		});

	// Sort by fontSize descending — larger labels take priority and stay put
	const sorted = [...configs].sort((a, b) => b.fontSize - a.fontSize);
	const adjustments = new Map<string, { svgX: number; svgY: number }>();

	for (const label of sorted) {
		let svgX = label.svgX;
		let svgY = label.svgY;

		for (let attempt = 0; attempt < 20; attempt++) {
			const box = getBox(label, svgX, svgY);
			const conflict = placed.find((p) => overlaps(box, p.box));
			if (!conflict) break;
			// Push away from conflict in Y
			const overlap = conflict.box.hh + box.hh - Math.abs(svgY - conflict.box.cy);
			svgY += svgY >= conflict.box.cy ? overlap : -overlap;
		}

		placed.push({ id: label.regionId, box: getBox(label, svgX, svgY) });
		adjustments.set(label.regionId, { svgX, svgY });
	}

	// Return in original order with adjusted positions
	return configs.map((c) => {
		const adj = adjustments.get(c.regionId);
		return adj ? { ...c, svgX: adj.svgX, svgY: adj.svgY } : c;
	});
}

// ---------------------------------------------------------------------------
// Exported constants
// ---------------------------------------------------------------------------

export const LABEL_CONFIGS = deconflictLabels(computeLabelConfigs());
export const CAPITAL_CONFIGS = computeCapitalConfigs();
