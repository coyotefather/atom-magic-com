'use client';

import { useState, useEffect } from 'react';
import { SVGOverlay, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MAP_CONFIG } from '@/lib/map-data';
import { CAPITAL_CONFIGS } from '@/lib/label-config';

const bounds = L.latLngBounds(
	L.latLng(MAP_CONFIG.BOUNDS_SW[0], MAP_CONFIG.BOUNDS_SW[1]),
	L.latLng(MAP_CONFIG.BOUNDS_NE[0], MAP_CONFIG.BOUNDS_NE[1])
);

const CapitalMarkers = () => {
	const map = useMap();
	const [paneReady, setPaneReady] = useState(false);

	useEffect(() => {
		if (!map.getPane('capitalLabelsPane')) {
			map.createPane('capitalLabelsPane');
			map.getPane('capitalLabelsPane')!.style.zIndex = '520';
			map.getPane('capitalLabelsPane')!.style.pointerEvents = 'none';
		}
		setPaneReady(true);
	}, [map]);

	if (!paneReady || CAPITAL_CONFIGS.length === 0) return null;

	return (
		<SVGOverlay bounds={bounds} pane="capitalLabelsPane" interactive={false}>
			<svg viewBox={`0 0 ${MAP_CONFIG.SVG_WIDTH} ${MAP_CONFIG.SVG_HEIGHT}`} preserveAspectRatio="none">
				{CAPITAL_CONFIGS.map((capital) => (
					<g key={capital.id}>
						<circle cx={capital.svgX} cy={capital.svgY} r="1.5" fill="#1a1a1a" />
						<text
							x={capital.svgX + 3}
							y={capital.svgY}
							dominantBaseline="central"
							fontFamily="'Noto Serif', serif"
							fontStyle="italic"
							fontSize="5"
							fill="#1a1a1a"
							style={{ textTransform: 'uppercase' as const }}
						>
							{capital.name}
						</text>
					</g>
				))}
			</svg>
		</SVGOverlay>
	);
};

export default CapitalMarkers;
