'use client';

import { useState, useEffect } from 'react';
import { SVGOverlay, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MAP_CONFIG } from '@/lib/map-data';

const OCEAN_LABELS = [
	{ name: 'OCEANVS HIBERNIAE',  x: 590,  y: 165 },
	{ name: 'OCEANVS ALBIS',      x: 1330, y: 240 },
	{ name: 'OCEANVS CAMBRIAE',   x: 580,  y: 620 },
	{ name: 'OCEANVS MERIDIANVS', x: 1180, y: 680 },
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
						fontSize={20}
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
