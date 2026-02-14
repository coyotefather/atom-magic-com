'use client';

import { useState, useEffect } from 'react';
import { SVGOverlay, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MAP_CONFIG, MAP_CAPITALS } from '@/lib/map-data';

const DIVISOR = 32; // 2^maxZoom

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

	if (!paneReady || MAP_CAPITALS.length === 0) return null;

	return (
		<SVGOverlay bounds={bounds} pane="capitalLabelsPane" interactive={false}>
			<svg viewBox={`0 0 ${MAP_CONFIG.SVG_WIDTH} ${MAP_CONFIG.SVG_HEIGHT}`} preserveAspectRatio="none">
				{MAP_CAPITALS.map((capital) => {
					const svgX = capital.lng * DIVISOR;
					const svgY = -capital.lat * DIVISOR;
					return (
						<g key={capital.id}>
							<circle cx={svgX} cy={svgY} r="1.5" fill="#1a1a1a" />
							<text
								x={svgX + 3}
								y={svgY}
								dominantBaseline="central"
								fontFamily="'Noto Serif', serif"
								fontStyle="italic"
								fontSize="5"
								fill="#1a1a1a"
								paintOrder="stroke fill"
								stroke="#F5F3ED"
								strokeWidth="2"
								strokeLinejoin="round"
							>
								{capital.name}
							</text>
						</g>
					);
				})}
			</svg>
		</SVGOverlay>
	);
};

export default CapitalMarkers;
