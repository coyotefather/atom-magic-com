'use client';

import { useState, useEffect } from 'react';
import { SVGOverlay, useMap, useMapEvent } from 'react-leaflet';
import L from 'leaflet';
import { MAP_CONFIG, MAP_CITIES } from '@/lib/map-data';

const bounds = L.latLngBounds(
	L.latLng(MAP_CONFIG.BOUNDS_SW[0], MAP_CONFIG.BOUNDS_SW[1]),
	L.latLng(MAP_CONFIG.BOUNDS_NE[0], MAP_CONFIG.BOUNDS_NE[1])
);

const capitals = MAP_CITIES.filter((c) => c.capital);
const nonCapitals = MAP_CITIES.filter((c) => !c.capital);

const CityLabels = () => {
	const map = useMap();
	const [paneReady, setPaneReady] = useState(false);
	const [zoom, setZoom] = useState(() => map.getZoom());

	useEffect(() => {
		if (!map.getPane('capitalLabelsPane')) {
			map.createPane('capitalLabelsPane');
			map.getPane('capitalLabelsPane')!.style.zIndex = '520';
			map.getPane('capitalLabelsPane')!.style.pointerEvents = 'none';
		}
		setPaneReady(true);
	}, [map]);

	useMapEvent('zoomend', () => setZoom(map.getZoom()));

	if (!paneReady) return null;

	const showNonCapitals = zoom >= MAP_CONFIG.MAX_ZOOM;

	return (
		<SVGOverlay bounds={bounds} pane="capitalLabelsPane" interactive={false}>
			<svg viewBox={`0 0 ${MAP_CONFIG.SVG_WIDTH} ${MAP_CONFIG.SVG_HEIGHT}`} preserveAspectRatio="none">
				{/* Non-capitals — max zoom only */}
				{showNonCapitals && nonCapitals.map((city) => (
					<g key={city.i}>
						<circle cx={city.svgX} cy={city.svgY} r="0.8" fill="#1a1a1a" />
						<text
							x={city.svgX + 2}
							y={city.svgY}
							dominantBaseline="central"
							fontFamily="'Noto Serif', serif"
							fontStyle="italic"
							fontSize="3"
							fill="#1a1a1a"
							style={{ textTransform: 'uppercase' as const }}
						>
							{city.name}
						</text>
					</g>
				))}
				{/* Capitals — always visible */}
				{capitals.map((city) => (
					<g key={city.i}>
						<circle cx={city.svgX} cy={city.svgY} r="1.5" fill="#1a1a1a" />
						<text
							x={city.svgX + 3}
							y={city.svgY}
							dominantBaseline="central"
							fontFamily="'Noto Serif', serif"
							fontStyle="italic"
							fontSize="5"
							fill="#1a1a1a"
							style={{ textTransform: 'uppercase' as const }}
						>
							{city.name}
						</text>
					</g>
				))}
			</svg>
		</SVGOverlay>
	);
};

export default CityLabels;
