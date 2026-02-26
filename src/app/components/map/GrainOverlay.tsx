'use client';

import { useState, useEffect } from 'react';
import { SVGOverlay, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MAP_CONFIG } from '@/lib/map-data';

/** Warm brownish paper grain texture at ~10% opacity over the whole map. */
const GrainOverlay = () => {
	const map = useMap();
	const [paneReady, setPaneReady] = useState(false);

	useEffect(() => {
		if (!map.getPane('grainPane')) {
			map.createPane('grainPane');
		}
		map.getPane('grainPane')!.style.zIndex = '170';
		setPaneReady(true);
	}, [map]);

	if (!paneReady) return null;

	const bounds = L.latLngBounds(
		L.latLng(MAP_CONFIG.BOUNDS_SW[0], MAP_CONFIG.BOUNDS_SW[1]),
		L.latLng(MAP_CONFIG.BOUNDS_NE[0], MAP_CONFIG.BOUNDS_NE[1])
	);

	return (
		<SVGOverlay bounds={bounds} pane="grainPane" interactive={false}>
			<svg
				viewBox={`0 0 ${MAP_CONFIG.SVG_WIDTH} ${MAP_CONFIG.SVG_HEIGHT}`}
				preserveAspectRatio="none"
			>
				<defs>
					<filter id="paper-grain">
						<feTurbulence
							type="fractalNoise"
							baseFrequency="0.9 0.9"
							numOctaves={4}
							seed={2}
							result="noise"
						/>
						<feColorMatrix
							type="matrix"
							values="0 0 0 0 0.4  0 0 0 0 0.35  0 0 0 0 0.25  0 0 0 0.10 0"
							in="noise"
						/>
					</filter>
					<filter id="paper-blotch">
						<feTurbulence
							type="fractalNoise"
							baseFrequency="0.025 0.025"
							numOctaves={2}
							seed={7}
							result="noise"
						/>
						<feColorMatrix
							type="matrix"
							values="0 0 0 0 0.35  0 0 0 0 0.30  0 0 0 0 0.20  0 0 0 0.07 0"
							in="noise"
						/>
					</filter>
				</defs>
				<rect
					width={MAP_CONFIG.SVG_WIDTH}
					height={MAP_CONFIG.SVG_HEIGHT}
					filter="url(#paper-blotch)"
				/>
				<rect
					width={MAP_CONFIG.SVG_WIDTH}
					height={MAP_CONFIG.SVG_HEIGHT}
					filter="url(#paper-grain)"
				/>
			</svg>
		</SVGOverlay>
	);
};

export default GrainOverlay;
