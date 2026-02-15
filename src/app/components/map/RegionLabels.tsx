'use client';

import { useState, useEffect } from 'react';
import { SVGOverlay, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MAP_CONFIG } from '@/lib/map-data';
import { LABEL_CONFIGS } from '@/lib/label-config';

const bounds = L.latLngBounds(
	L.latLng(MAP_CONFIG.BOUNDS_SW[0], MAP_CONFIG.BOUNDS_SW[1]),
	L.latLng(MAP_CONFIG.BOUNDS_NE[0], MAP_CONFIG.BOUNDS_NE[1])
);

interface RegionLabelsProps {
	focusedRegionId?: string | null;
}

const RegionLabels = ({ focusedRegionId }: RegionLabelsProps) => {
	const map = useMap();
	const [paneReady, setPaneReady] = useState(false);

	useEffect(() => {
		if (!map.getPane('regionLabelsPane')) {
			map.createPane('regionLabelsPane');
			map.getPane('regionLabelsPane')!.style.zIndex = '500';
			map.getPane('regionLabelsPane')!.style.pointerEvents = 'none';
		}
		setPaneReady(true);
	}, [map]);

	if (!paneReady || LABEL_CONFIGS.length === 0) return null;

	const visibleLabels = focusedRegionId
		? LABEL_CONFIGS.filter((l) => l.regionId === focusedRegionId)
		: LABEL_CONFIGS;

	return (
		<SVGOverlay bounds={bounds} pane="regionLabelsPane" interactive={false}>
			<svg viewBox={`0 0 ${MAP_CONFIG.SVG_WIDTH} ${MAP_CONFIG.SVG_HEIGHT}`} preserveAspectRatio="none">
				{visibleLabels.map((label) => (
					<text
						key={label.regionId}
						x={label.svgX}
						y={label.svgY}
						textAnchor="middle"
						dominantBaseline="central"
						fontFamily="'Marcellus', serif"
						fontSize={label.fontSize}
						fill="#8B2500"
						letterSpacing="0.2em"
						textDecoration="none"
						paintOrder="stroke fill"
						stroke="#F5F3ED"
						strokeWidth="3"
						strokeLinejoin="round"
						style={{ textTransform: 'uppercase' as const }}
						transform={label.angle ? `rotate(${label.angle}, ${label.svgX}, ${label.svgY})` : undefined}
					>
						{label.name}
					</text>
				))}
			</svg>
		</SVGOverlay>
	);
};

export default RegionLabels;
