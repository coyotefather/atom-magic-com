/**
 * OceanLabels.tsx
 *
 * Renders the names of the four surrounding oceans/seas in the open water
 * areas of the map. Labels are static strings defined inline — there is no
 * CMS or external data source for ocean names. Each label has a manually
 * tuned SVG x/y position and font size to fit its ocean area.
 *
 * Labels are drawn at 32% opacity in a warm brown tone (#6B5B3E) with wide
 * letter-spacing, matching the aesthetic of historical cartographic sea labels.
 * All four names are rendered in Latin (e.g., "OCEANVS HIBERNIAE").
 *
 * Rendering technique: Leaflet SVGOverlay inside a custom pane
 * ("oceanLabelsPane", z-index 155, pointer-events none). Positions are given
 * in SVG pixel units directly (not converted from lat/lng), so they were
 * hand-tuned against the map canvas dimensions (MAP_CONFIG.SVG_WIDTH × HEIGHT).
 *
 * Used by:
 *   - SolumMap.tsx (rendered inside the Leaflet MapContainer)
 */
'use client';

import { useState, useEffect } from 'react';
import { SVGOverlay, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MAP_CONFIG } from '@/lib/map-data';

const OCEAN_LABELS = [
	{ name: 'OCEANVS HIBERNIAE',  x: 200,  y: 90,  fontSize: 15 },
	{ name: 'OCEANVS ALBIS',      x: 1360, y: 55,  fontSize: 12 },
	{ name: 'OCEANVS CAMBRIAE',   x: 350,  y: 680, fontSize: 15 },
	{ name: 'OCEANVS MERIDIANVS', x: 1050, y: 733, fontSize: 14 },
] as const;

const OceanLabels = () => {
	const map = useMap();
	const [paneReady, setPaneReady] = useState(false);

	useEffect(() => {
		if (!map.getPane('oceanLabelsPane')) {
			map.createPane('oceanLabelsPane');
			map.getPane('oceanLabelsPane')!.style.zIndex = '155';
			map.getPane('oceanLabelsPane')!.style.pointerEvents = 'none';
		}
		setPaneReady(true);
	}, [map]);

	if (!paneReady) return null;

	const bounds = L.latLngBounds(
		L.latLng(MAP_CONFIG.BOUNDS_SW[0], MAP_CONFIG.BOUNDS_SW[1]),
		L.latLng(MAP_CONFIG.BOUNDS_NE[0], MAP_CONFIG.BOUNDS_NE[1])
	);

	return (
		<SVGOverlay bounds={bounds} pane="oceanLabelsPane" interactive={false}>
			<svg
				viewBox={`0 0 ${MAP_CONFIG.SVG_WIDTH} ${MAP_CONFIG.SVG_HEIGHT}`}
				preserveAspectRatio="none"
			>
				{OCEAN_LABELS.map((label) => (
					<text
						key={label.name}
						x={label.x}
						y={label.y}
						textAnchor="middle"
						dominantBaseline="central"
						fontFamily="'Noto Serif', serif"
						fontSize={label.fontSize}
						fill="#6B5B3E"
						opacity={0.32}
						letterSpacing={2}
					>
						{label.name}
					</text>
				))}
			</svg>
		</SVGOverlay>
	);
};

export default OceanLabels;
