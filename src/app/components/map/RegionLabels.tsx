/**
 * RegionLabels.tsx
 *
 * Renders the name of each political/geographic region on the map as SVG text.
 * Multi-word names are split and stacked vertically (one word per tspan), with
 * the stack centered on the pre-computed label position. This matches the
 * traditional cartographic style where long region names wrap across their
 * territory.
 *
 * Label positions and sizes are pre-computed in lib/label-config.ts
 * (LABEL_CONFIGS) rather than calculated at runtime, so they are stable and can
 * be manually adjusted. Each config entry has svgX, svgY, fontSize, and a
 * regionId tying it back to MAP_REGIONS.
 *
 * When a region is focused (focusedRegionId prop is set), only that region's
 * label is shown, reducing visual noise while the detail panel is open.
 *
 * Rendering technique: Leaflet SVGOverlay inside a custom pane
 * ("regionLabelsPane", z-index 500, pointer-events none). Text is uppercase
 * Marcellus in oxblood red (#8B2500) with wide letter-spacing.
 *
 * Used by:
 *   - SolumMap.tsx (rendered inside the Leaflet MapContainer)
 */
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
				{visibleLabels.map((label) => {
					const words = label.name.split(/\s+/);
					const lineHeight = label.fontSize * 1.25;
					const yStart = label.svgY - ((words.length - 1) * lineHeight) / 2;
					return (
						<text
							key={label.regionId}
							x={label.svgX}
							y={yStart}
							textAnchor="middle"
							dominantBaseline="central"
							fontFamily="'Marcellus', serif"
							fontSize={label.fontSize}
							fill="#8B2500"
							letterSpacing="0.2em"
							style={{ textTransform: 'uppercase' as const }}
						>
							{words.map((word, i) => (
								<tspan key={i} x={label.svgX} dy={i === 0 ? 0 : lineHeight}>
									{word}
								</tspan>
							))}
						</text>
					);
				})}
			</svg>
		</SVGOverlay>
	);
};

export default RegionLabels;
